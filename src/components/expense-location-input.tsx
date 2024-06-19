import { useToast } from '@/components/ui/use-toast'
import { ExpenseFormValues } from '@/lib/schemas'
import { AsyncButton } from './async-button'
import { MapComponent } from './map'
import { Button } from './ui/button'

type Props = {
  location: ExpenseFormValues['location']
  updateLocation: (location: ExpenseFormValues['location']) => void
}

export function ExpenseLocationInput({ location, updateLocation }: Props) {
  const { toast } = useToast()

  async function getCoordinates(): Promise<GeolocationPosition> {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
  }

  async function setCoordinates(): Promise<undefined> {
    try {
      const { latitude, longitude } = (await getCoordinates()).coords
      updateLocation({ latitude, longitude })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error while determining location',
        description:
          'Something wrong happened when determining your current location. Please approve potential authorisation dialogues or try again later.',
        variant: 'destructive',
      })
    }
  }

  function unsetCoordinates() {
    updateLocation(null)
  }

  return (
    <>
      {location && (
        <MapComponent
          latitude={location.latitude}
          longitude={location.longitude}
        />
      )}
      <div className="flex gap-2">
        <AsyncButton
          type="button"
          variant="default"
          loadingContent="Getting location…"
          action={setCoordinates}
        >
          {location ? (
            <>Update to current location</>
          ) : (
            <>Use current location</>
          )}
        </AsyncButton>
        {location && (
          <Button
            size="default"
            variant="destructive"
            type="button"
            onClick={unsetCoordinates}
          >
            Remove
          </Button>
        )}
      </div>
    </>
  )
}