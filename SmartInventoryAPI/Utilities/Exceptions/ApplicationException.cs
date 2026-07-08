namespace SmartInventoryAPI.Utilities.Exceptions;

public class ApplicationException : Exception
{
    public ApplicationException(string? message) : base(message)
    {
    }
}
