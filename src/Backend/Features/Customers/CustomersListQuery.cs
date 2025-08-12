namespace Backend.Features.Customers;

public class CustomersListQuery : IRequest<CustomeResponse>
{
    public string? Name { get; set; }
    public string? Email { get; set; }

    public int CurrentPage { get; set; }
    public int ItemsPerPage { get; set; }
}


public class Customer
{
    public int Id { get; set; }
    public string Name { get; internal set; } = "";
    public string Address { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Iban { get; set; } = "";
    public string CategoryCode { get; set; } = "";
    public string CategoryDescription { get; set; } = "";
}

public class CustomeResponse
{
    public List<Customer> Customers { get; set; } = [];
    public long Count { get; set; }
}



internal class CustomersListQueryHandler(BackendContext context) : IRequestHandler<CustomersListQuery, CustomeResponse>
{
    private readonly BackendContext context = context;

    public async Task<CustomeResponse> Handle(CustomersListQuery request, CancellationToken cancellationToken)
    {
        var query = context.Customers.AsQueryable();
        if (!string.IsNullOrEmpty(request.Name))
        {
            query = query.Where(q => q.Name.ToLower().StartsWith(request.Name.ToLower()));
        }
        if (!string.IsNullOrEmpty(request.Email))
        {
            query = query.Where(q => q.Email.ToLower().StartsWith(request.Email.ToLower()));
        }
        query = query.Include(c => c.CustomerCategory);

        var totalItems = await query.CountAsync(cancellationToken);

        var startIndex = (request.CurrentPage - 1) * request.ItemsPerPage;

        var data = await query.OrderBy(q => q.Name).ThenBy(q => q.Name)
        .Skip(startIndex)
        .Take(request.ItemsPerPage)
        .ToListAsync(cancellationToken);
        var result = new List<Customer>();

        foreach (var item in data)
        {
            var resultItem = new Customer
            {
                Id = item.Id,
                Name = item.Name,
                Address = item.Address,
                Email = item.Email,
                Phone = item.Phone,
                Iban = item.Iban
            };

            if (item.CustomerCategory is not null)
            {
                resultItem.CategoryCode = item.CustomerCategory.Code;
                resultItem.CategoryDescription = item.CustomerCategory.Description;
            }

            result.Add(resultItem);
        }

        return new CustomeResponse
        {
            Customers = result,
            Count = totalItems
        };
        
    }
}