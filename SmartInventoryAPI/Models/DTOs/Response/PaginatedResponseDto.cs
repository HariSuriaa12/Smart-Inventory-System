namespace SmartInventoryAPI.Models.DTOs.Response;

/// <summary>
/// Generic paginated response DTO that wraps data with pagination metadata
/// </summary>
public class PaginatedResponseDto<T>
{
    /// <summary>
    /// The actual data items for the current page
    /// </summary>
    public IEnumerable<T> Data { get; set; } = new List<T>();

    /// <summary>
    /// Total number of items in the database (excluding deleted items)
    /// </summary>
    public int Total { get; set; }

    /// <summary>
    /// Number of items skipped (offset)
    /// </summary>
    public int Skip { get; set; }

    /// <summary>
    /// Number of items per page
    /// </summary>
    public int Take { get; set; }

    /// <summary>
    /// Current page number (1-indexed)
    /// </summary>
    public int Page { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages { get; set; }

    /// <summary>
    /// Whether there are more pages after the current one
    /// </summary>
    public bool HasNextPage { get; set; }

    /// <summary>
    /// Whether there are pages before the current one
    /// </summary>
    public bool HasPreviousPage { get; set; }
}
