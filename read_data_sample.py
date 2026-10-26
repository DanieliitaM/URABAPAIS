import zipfile
import xml.etree.ElementTree as ET

def inspect_xlsx(path):
    import json, datetime

    with zipfile.ZipFile(path, 'r') as z:
        # sheet names
        wb_tree = ET.fromstring(z.read('xl/workbook.xml'))
        sheet_names = {}
        for s in wb_tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet'):
            sheet_names[s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')] = s.attrib.get('name')
        print("Workbook sheets:", sheet_names)

        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for elem in tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                text_parts = [t.text for t in elem.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t') if t.text]
                shared_strings.append("".join(text_parts))

        tree = ET.fromstring(z.read('xl/worksheets/sheet2.xml'))
        rows = []
        for row in tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            row_data = []
            for cell in row.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                val = ''
                cell_type = cell.attrib.get('t', '')
                v_elem = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                is_elem = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is')
                if cell_type == 's' and v_elem is not None and v_elem.text:
                    idx = int(v_elem.text)
                    val = shared_strings[idx] if idx < len(shared_strings) else v_elem.text
                elif cell_type == 'inlineStr' and is_elem is not None:
                    t = is_elem.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    val = t.text if t is not None else ''
                elif v_elem is not None and v_elem.text:
                    val = v_elem.text
                row_data.append(val)
            if any(row_data):
                rows.append(row_data)

        headers = rows[0]
        data = []
        excel_epoch = datetime.datetime(1899, 12, 30)
        for r in rows[1:]:
            item = {}
            for i, h in enumerate(headers):
                val = r[i] if i < len(r) else ''
                # convert excel dates
                if h in ['Fecha_registro', 'Fecha_atencion'] and val:
                    try:
                        days = float(val)
                        d = excel_epoch + datetime.timedelta(days=days)
                        val = d.strftime('%Y-%m-%d')
                    except Exception:
                        pass
                if h == 'Edad' and val:
                    try:
                        val = int(float(val))
                    except Exception:
                        pass
                item[h] = val
            data.append(item)
        print(f"Parsed {len(data)} items from sheet2")
        with open('seed_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Saved seed_data.json successfully")

if __name__ == '__main__':
    inspect_xlsx('Base_Beneficiarios_Hackathon.xlsx')
