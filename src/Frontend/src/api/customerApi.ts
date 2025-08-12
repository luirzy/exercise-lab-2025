export interface Customer {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  iban: string;
  categoryCode: string;
  categoryDescription: string;
}

export type CustomerFilters = {
  name?: string;
  email?: string;
};

export const fetchCustomers = async (filters: CustomerFilters): Promise<Customer[]> => {
  const params = new URLSearchParams();
    if(filters){
        if (filters.name) {
            params.append('name', filters.name);
        }
        if (filters.email) {
            params.append('email', filters.email);
        }
    }

    const response = await  fetch(`/api/customers/list?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Error when fetching cusotmers');
    }
    return response.json();
};

