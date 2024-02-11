import { cached } from '@/app/cached-functions'
import { ExpenseForm } from '@/components/expense-form'
import { createExpense, getCategories } from '@/lib/api'
import { expenseFormSchema } from '@/lib/schemas'
import { getFeatureFlags } from '@/lib/serverActions'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Create expense',
}

export default async function ExpensePage({
  params: { groupId },
}: {
  params: { groupId: string }
}) {
  const categories = await getCategories()
  const group = await cached.getGroup(groupId)
  if (!group) notFound()

  async function createExpenseAction(values: unknown) {
    'use server'
    const expenseFormValues = expenseFormSchema.parse(values)
    await createExpense(expenseFormValues, groupId)
    redirect(`/groups/${groupId}`)
  }

  const featureFlags = await getFeatureFlags()

  return (
    <Suspense>
      <ExpenseForm
        group={group}
        categories={categories}
        onSubmit={createExpenseAction}
        featureFlags={featureFlags}
      />
    </Suspense>
  )
}
