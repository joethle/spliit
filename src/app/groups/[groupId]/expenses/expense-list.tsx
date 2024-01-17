'use client'
import { CategoryIcon } from '@/app/groups/[groupId]/expenses/category-icon'
import { Button } from '@/components/ui/button'
import { getGroupExpenses } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Expense, Participant } from '@prisma/client'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect } from 'react'

type Props = {
  expenses: Awaited<ReturnType<typeof getGroupExpenses>>
  participants: Participant[]
  currency: string
  groupId: string
}

function getGroupedExpensesByDate(
  expenses: Awaited<ReturnType<typeof getGroupExpenses>>,
) {
  return expenses.reduce(
    (result: { [key: string]: Expense[] }, expense: Expense) => {
      const dateString = formatDate(expense.expenseDate)
      result[dateString] = result[dateString] ?? []
      result[dateString].push(expense)
      return result
    },
    {},
  )
}

function getOrderedDates(dates: string[]) {
  return dates.sort(function (a: string, b: string) {
    return new Date(b).getTime() - new Date(a).getTime()
  })
}

export function ExpenseList({
  expenses,
  currency,
  participants,
  groupId,
}: Props) {
  useEffect(() => {
    const activeUser = localStorage.getItem('newGroup-activeUser')
    const newUser = localStorage.getItem(`${groupId}-newUser`)
    if (activeUser || newUser) {
      localStorage.removeItem('newGroup-activeUser')
      localStorage.removeItem(`${groupId}-newUser`)
      if (activeUser === 'None') {
        localStorage.setItem(`${groupId}-activeUser`, 'None')
      } else {
        const userId = participants.find(
          (p) => p.name === (activeUser || newUser),
        )?.id
        if (userId) {
          localStorage.setItem(`${groupId}-activeUser`, userId)
        }
      }
    }
  }, [groupId, participants])

  const getParticipant = (id: string) => participants.find((p) => p.id === id)
  const router = useRouter()

  const groupedExpensesByDate = getGroupedExpensesByDate(expenses)

  return expenses.length > 0 ? (
    getOrderedDates(Object.keys(groupedExpensesByDate)).map(
      (dateString: string) => {
        const dateExpenses = groupedExpensesByDate[dateString]
        return (
          <Fragment key={dateString}>
            <div className={'border-t text-md pl-3 py-2 font-semibold'}>
              {dateString}
            </div>
            {dateExpenses.map((expense: any) => (
              <div
                key={expense.id}
                className={cn(
                  'border-t flex justify-between px-4 sm:pr-2 sm:pl-6 py-4 text-sm cursor-pointer hover:bg-accent gap-1 items-stretch',
                  expense.isReimbursement && 'italic',
                )}
                onClick={() => {
                  router.push(`/groups/${groupId}/expenses/${expense.id}/edit`)
                }}
              >
                <CategoryIcon
                  category={expense.category}
                  className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground"
                />
                <div className="flex-1">
                  <div
                    className={cn('mb-1', expense.isReimbursement && 'italic')}
                  >
                    {expense.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Paid by{' '}
                    <strong>{getParticipant(expense.paidById)?.name}</strong>{' '}
                    for{' '}
                    {expense.paidFor.map((paidFor: any, index: number) => (
                      <Fragment key={index}>
                        {index !== 0 && <>, </>}
                        <strong>
                          {
                            participants.find(
                              (p) => p.id === paidFor.participantId,
                            )?.name
                          }
                        </strong>
                      </Fragment>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <div
                    className={cn(
                      'tabular-nums whitespace-nowrap',
                      expense.isReimbursement ? 'italic' : 'font-bold',
                    )}
                  >
                    {currency} {(expense.amount / 100).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(expense.expenseDate)}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="link"
                  className="self-center hidden sm:flex"
                  asChild
                >
                  <Link href={`/groups/${groupId}/expenses/${expense.id}/edit`}>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </Fragment>
        )
      },
    )
  ) : (
    <p className="px-6 text-sm py-6">
      Your group doesn’t contain any expense yet.{' '}
      <Button variant="link" asChild className="-m-4">
        <Link href={`/groups/${groupId}/expenses/create`}>
          Create the first one
        </Link>
      </Button>
    </p>
  )
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
}
