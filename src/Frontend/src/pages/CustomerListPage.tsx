import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  CircularProgress,
  Box,
  TextField,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import { useState } from "react";
import { useDebounce } from "../util/useDebounce";
import { useCustomers } from "../hooks/use-customers";

export default function CustomerListPage() {
  // const [customers, setCustomers] = useState<Customer[]>([]);

  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  const debouncedNameFilter = useDebounce(nameFilter, 500);
  const debouncedEmailFilter = useDebounce(emailFilter, 500);

  const {data: customers, isLoading,error} = useCustomers({ name: debouncedNameFilter, email: debouncedEmailFilter });


  const updateFilterHandler = (event) => {
    if (event.target.name === "name") {
      setNameFilter(event.target.value);
    } else {
      setEmailFilter(event.target.value);
    }
  };

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Customers
      </Typography>

      <Box
        component="section"
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          name="name"
          label="Filter by name"
          value={nameFilter}
          onChange={updateFilterHandler}
          fullWidth
        />
        <TextField
          name="email"
          label="Filter by email"
          variant="outlined"
          value={emailFilter}
          onChange={updateFilterHandler}
          fullWidth
        />
      </Box>

      {isLoading && <CircularProgress />}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!error && !isLoading && customers.length === 0 && (
        <Typography variant="h6" color="text.primary" sx={{ p: 2 }}>
          Found no customers.
        </Typography>
      )}
      {!isLoading && customers.length > 0 && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Name</StyledTableHeadCell>
                <StyledTableHeadCell>Address</StyledTableHeadCell>
                <StyledTableHeadCell>Email</StyledTableHeadCell>
                <StyledTableHeadCell>Phone</StyledTableHeadCell>
                <StyledTableHeadCell>Iban</StyledTableHeadCell>
                <StyledTableHeadCell>Category Code</StyledTableHeadCell>
                <StyledTableHeadCell>Category Description</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.iban}</TableCell>
                  <TableCell>{customer.categoryCode}</TableCell>
                  <TableCell>{customer.categoryDescription}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
  },
}));
