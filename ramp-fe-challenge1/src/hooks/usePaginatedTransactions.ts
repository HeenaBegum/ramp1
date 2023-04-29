import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export interface PaginatedResponseWithLastPage<T> extends PaginatedResponse<T> {
  isLastPage: boolean;
  
}

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)
 
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null); // Add selectedEmployee state bug 6-part1
   // add new state
  const [disableViewMore, setDisableViewMore] = useState<boolean>(false)
   const [hasMoreData, setHasMoreData] = useState(true)

   


  //bug-4   function to merge the previous transactions with the new ones instead of replacing them.
  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
        ...(selectedEmployee && { employee: selectedEmployee }) // Add employee filter to request if selectedEmployee is not null bug6-1
      }
    )
  
    setPaginatedTransactions((previousResponse) => {///edited response instead of previousresponse
      if (response === null || previousResponse === null) {
        return response
      }
       // check if there is no more data to fetch 6-1
       if (response.nextPage === null) {
        setDisableViewMore(true)
      }
  
      return {
        data: previousResponse ? [...previousResponse.data, ...response.data] : response.data,
        nextPage: response.nextPage
      }
    })

    //
    
  }, [fetchWithCache, paginatedTransactions,selectedEmployee]) // // Add selectedEmployee dependency bug6-1
  

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
    setDisableViewMore(false) // reset disableViewMore on invalidation
  }, [])

  // Add onChangeSelectedEmployee function to update the selectedEmployee state bug: 6-1
  const onChangeSelectedEmployee = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEmployee(event.target.value);
    invalidateData();
  }, [invalidateData]);

  return{

  data: paginatedTransactions, 
  loading,
   fetchAll, 
  invalidateData,
   // Add onChangeSelectedEmployee to expose the function to the component
  }
}
