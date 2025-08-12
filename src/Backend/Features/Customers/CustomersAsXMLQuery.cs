using System.Xml;

public class CustomersAsXMLQuery : IRequest<CustomerXmlStreamResult>
{
    public string? Name { get; set; }
    public string? Email { get; set; }
}


public record CustomerXmlStreamResult(
    Func<Stream, Task> StreamAction,
    string ContentType,
    string FileDownloadName
);



internal class CustomersXMLQueryHandler(BackendContext context) : IRequestHandler<CustomersAsXMLQuery, CustomerXmlStreamResult>
{
    private readonly BackendContext context = context;

    public async Task<CustomerXmlStreamResult> Handle(CustomersAsXMLQuery request, CancellationToken cancellationToken)
    {

        Func<Stream, Task> streamAction = async responseStream =>
        {
            var settings = new XmlWriterSettings { Async = true, Indent = true };
            await using var writer = XmlWriter.Create(responseStream, settings);

            await writer.WriteStartDocumentAsync();
            await writer.WriteStartElementAsync(null, "Customers", null);

            var customersQuery = context.Customers.AsNoTracking();
            if (!string.IsNullOrEmpty(request.Name))
            {
                customersQuery = customersQuery.Where(q => q.Name.ToLower().StartsWith(request.Name.ToLower()));
            }
            if (!string.IsNullOrEmpty(request.Email))
            {
                customersQuery = customersQuery.Where(q => q.Email.ToLower().StartsWith(request.Email.ToLower()));
            }
            customersQuery = customersQuery.Include(c => c.CustomerCategory);


            await foreach (var customer in customersQuery.AsAsyncEnumerable().WithCancellation(cancellationToken))
            {
                await writer.WriteStartElementAsync(null, "Customer", null);
                await writer.WriteElementStringAsync(null, "Id", null, customer.Id.ToString());
                await writer.WriteElementStringAsync(null, "Name", null, customer.Name);
                await writer.WriteElementStringAsync(null, "Address", null, customer.Address);
                await writer.WriteElementStringAsync(null, "Email", null, customer.Email);
                await writer.WriteElementStringAsync(null, "Phone", null, customer.Phone);
                await writer.WriteElementStringAsync(null, "Iban", null, customer.Iban);
                if (customer.CustomerCategory is not null)
                {
                    await writer.WriteElementStringAsync(null, "CategoryCode", null, customer.CustomerCategory.Description);
                    await writer.WriteElementStringAsync(null, "CategoryDescription", null, customer.CustomerCategory.Code);
                }

                await writer.WriteEndElementAsync();
            }

            await writer.WriteEndElementAsync();
            await writer.WriteEndDocumentAsync();
            await writer.FlushAsync();
        };

        // Restituiamo il nostro DTO con l'azione e i metadati
        return new CustomerXmlStreamResult(
            StreamAction: streamAction,
            ContentType: "application/xml",
            FileDownloadName: "customers.xml"
        );
    }

}