import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {

  // useEmployees hook to get employees data
  const { data: employees, ...employeeUtils } = useEmployees()

  // usePaginatedTransactions hook to get paginated transactions data
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()

  // useTransactionsByEmployee hook to get transactions data filtered by employee
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()

  // isLoading state to indicate if data is being loaded
  const [isLoading, setIsLoading] = useState(false)

  // transactions data derived from paginatedTransactions and transactionsByEmployee
  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  // loadAllTransactions function to fetch all transactions and employees data...
  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    await paginatedTransactionsUtils.fetchAll()

    setIsLoading(false)
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  // loadTransactionsByEmployee function to fetch transactions filtered by employee 

  //bug-3
  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      if (employeeId === "") {
        await paginatedTransactionsUtils.fetchAll()
      } else {
        paginatedTransactionsUtils.invalidateData()
        await transactionsByEmployeeUtils.fetchById(employeeId)
      }
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  // check if employees data is not available, then fetch all transactions data
  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  // render main app UI
  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        {/* input select component to filter transactions by employee */}
        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }

            await loadTransactionsByEmployee(newValue.id)
          }
        }
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          {/* transactions component to display transactions data */}
          <Transactions transactions={transactions} />

          {/* View more button to load more transactions */}
          {transactions !== null && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
