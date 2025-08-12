import { useState, useEffect } from 'react';
// Potremmo importare la funzione dal service per mantenere le cose separate
import { fetchCustomers, CustomerFilters, Customer}  from '../api/customerApi'; 



export function useCustomers(filters: CustomerFilters) {
  const [data, setData] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    const getCustomers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const customers = await fetchCustomers(filters);
        setData(customers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknow error!');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    
    getCustomers();
    
  }, [filters.name, filters.email]); 


  return { data, isLoading, error };
}