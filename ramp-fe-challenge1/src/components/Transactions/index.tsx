import { useCallback, useEffect, useState } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams, Transaction } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions: initialTransactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()
  

  
  // Use useState hook to keep track of transactions bug-7
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions || [])

  // Define setTransactionApproval function bug-7
  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      // Use fetchWithoutCache function to update the transaction on the server bug-7
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      // Use the setTransactions function to update the transaction in the state bug-7
      setTransactions(prevTransactions => prevTransactions.map(t => {
        if (t.id === transactionId) {
          return { ...t, isApproved: newValue }
        }
        return t
      }))
    },
    [fetchWithoutCache]
  )

  // Use useEffect hook to update transactions when initialTransactions change bug-7
  useEffect(() => {
    setTransactions(initialTransactions || [])
  }, [initialTransactions])

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
          showCheckbox={true}
        />
      ))}
    </div>
  )
}