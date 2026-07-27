using ClosedXML.Excel;

namespace SmartInventoryAPI.Utilities;

public static class ExcelGenerator
{
    public static byte[] GenerateExcel(Dictionary<string, List<Dictionary<string, object?>>> sheetsData)
    {
        using (var workbook = new XLWorkbook())
        {
            foreach (var sheet in sheetsData)
            {
                var sheetName = sheet.Key;
                var data = sheet.Value;

                if (!data.Any())
                    continue;

                var worksheet = workbook.Worksheets.Add(sheetName);
                var headers = data.First().Keys.ToList();

                // Add headers
                for (int col = 0; col < headers.Count; col++)
                {
                    var headerCell = worksheet.Cell(1, col + 1);
                    headerCell.Value = headers[col];
                    headerCell.Style.Font.Bold = true;
                    headerCell.Style.Fill.BackgroundColor = XLColor.LightGray;
                    headerCell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                }

                // Add data rows
                for (int row = 0; row < data.Count; row++)
                {
                    var recordData = data[row];
                    for (int col = 0; col < headers.Count; col++)
                    {
                        var cell = worksheet.Cell(row + 2, col + 1);
                        var value = recordData.ContainsKey(headers[col]) ? recordData[headers[col]] : "";

                        if (value != null)
                        {
                            if (value is DateTime dt)
                                cell.Value = dt;
                            else if (value is decimal dec)
                                cell.Value = dec;
                            else if (value is int i)
                                cell.Value = i;
                            else if (value is long l)
                                cell.Value = l;
                            else if (value is bool b)
                                cell.Value = b ? "Yes" : "No";
                            else
                                cell.Value = value.ToString();
                        }

                        cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    }
                }

                // Auto-fit columns
                worksheet.Columns().AdjustToContents();
                foreach (var col in worksheet.Columns())
                {
                    if (col.Width > 50)
                        col.Width = 50;
                }
            }

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
        }
    }
}
