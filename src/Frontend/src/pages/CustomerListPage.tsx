import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Stack,
  TableHead,
  CircularProgress,
  TableFooter,
  Button,
  TablePagination,
  Box,
  TextField,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
} from "@mui/material";
import { useState } from "react";
import { useDebounce } from "../util/useDebounce";
import { CustomerFilters, fetchXmlCustomers } from "../api/customerApi";
import { useCustomers } from "../hooks/use-customers";

const defaultFilter: CustomerFilters = {
  currentPage: 0,
  itemsPerPage: 10,
};

export default function CustomerListPage() {
  const [filter, setFilter] = useState(defaultFilter);
  const debouncedFilter = useDebounce(filter, 500);

  const {
    data: customers,
    isLoading,
    error,
    count,
  } = useCustomers(debouncedFilter);

  const updateFilterHandler = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFilter((prevState) => {
      const newState = { ...prevState };
      if (event.target.name === "name") {
        newState.name = event.target.value;
      } else {
        newState.email = event.target.value;
      }
      newState.currentPage = 0;

      return newState;
    });
  };

  const pageChangeHandler = (event, newPage: number) => {
    setFilter((prevState) => {
      const newState = { ...prevState, currentPage: newPage };
      return newState;
    });
  };

  const rowPerPageChangedHandler = (event) => {
    setFilter((prevState) => {
      const newState = {
        ...prevState,
        currentPage: 0,
        itemsPerPage: parseInt(event.target.value, 10),
      };
      return newState;
    });
  };

  const exportAsXMLHandler = () => {
    fetchXmlCustomers({
      name: filter.name,
      email: filter.email,
    }).then((blobFile) => {
      const url = window.URL.createObjectURL(blobFile);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "customers.xml");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    });
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
          value={filter.name}
          onChange={updateFilterHandler}
          fullWidth
        />
        <TextField
          name="email"
          label="Filter by email"
          value={filter.email}
          onChange={updateFilterHandler}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={exportAsXMLHandler}>Export XML</Button>
      </Box>

      {isLoading && (
        <Stack sx={{ zIndex: 1300, color: '#fff' }} alignItems="center">
          <CircularProgress />
        </Stack>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

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
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  colSpan={3}
                  count={count}
                  rowsPerPage={filter.itemsPerPage}
                  page={filter.currentPage}
                  onPageChange={pageChangeHandler}
                  onRowsPerPageChange={rowPerPageChangedHandler}
                />
              </TableRow>
            </TableFooter>
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
