using System.Globalization;
using System.Text;
using CsvHelper;

namespace SmartInventoryAPI.Utilities;

public static class CsvGenerator
{
    public static byte[] GenerateCsv<T>(IEnumerable<T> records, string[] columnNames) where T : class
    {
        using (var memoryStream = new MemoryStream())
        using (var writer = new StreamWriter(memoryStream, Encoding.UTF8))
        using (var csv = new CsvWriter(writer, CultureInfo.InvariantCulture))
        {
            foreach (var columnName in columnNames)
            {
                csv.WriteField(columnName);
            }
            csv.NextRecord();

            foreach (var record in records)
            {
                var properties = typeof(T).GetProperties();
                foreach (var prop in properties)
                {
                    var value = prop.GetValue(record);
                    csv.WriteField(value?.ToString() ?? "");
                }
                csv.NextRecord();
            }

            writer.Flush();
            return memoryStream.ToArray();
        }
    }

    public static byte[] GenerateCsvFromDictionaries(IEnumerable<Dictionary<string, object?>> records, string[] columnNames)
    {
        using (var memoryStream = new MemoryStream())
        using (var writer = new StreamWriter(memoryStream, Encoding.UTF8))
        {
            var sb = new StringBuilder();

            sb.AppendLine(string.Join(",", columnNames.Select(EscapeCsvField)));

            foreach (var record in records)
            {
                var values = new List<string>();
                foreach (var columnName in columnNames)
                {
                    var value = record.ContainsKey(columnName) ? record[columnName]?.ToString() ?? "" : "";
                    values.Add(EscapeCsvField(value));
                }
                sb.AppendLine(string.Join(",", values));
            }

            writer.Write(sb.ToString());
            writer.Flush();
            return memoryStream.ToArray();
        }
    }

    public static byte[] GenerateCsvFromDictionariesV2(IEnumerable<Dictionary<string, object?>> records, string[] columnNames)
    {
        var sb = new StringBuilder();

        // 1. Write Header Row
        sb.AppendLine(string.Join(",", columnNames.Select(EscapeCsvField)));

        // 2. Write Data Rows
        foreach (var record in records)
        {
            var values = new List<string>();
            foreach (var columnName in columnNames)
            {
                var value = record.ContainsKey(columnName) ? record[columnName]?.ToString() ?? "" : "";
                values.Add(EscapeCsvField(value));
            }
            sb.AppendLine(string.Join(",", values));
        }

        // 3. Directly convert the built string to UTF8 bytes (with BOM for Excel compatibility)
        var csvText = sb.ToString();

        // Adding the BOM (Byte Order Mark) ensures Excel opens the CSV with correct UTF-8 encoding
        var bom = new byte[] { 0xEF, 0xBB, 0xBF };
        var textBytes = Encoding.UTF8.GetBytes(csvText);

        var finalBytes = new byte[bom.Length + textBytes.Length];
        Buffer.BlockCopy(bom, 0, finalBytes, 0, bom.Length);
        Buffer.BlockCopy(textBytes, 0, finalBytes, bom.Length, textBytes.Length);

        return finalBytes;
    }

    private static string EscapeCsvField(string? field)
    {
        if (string.IsNullOrEmpty(field))
            return "";

        if (field.Contains(",") || field.Contains("\"") || field.Contains("\n"))
            return $"\"{field.Replace("\"", "\"\"")}\"";

        return field;
    }
}
