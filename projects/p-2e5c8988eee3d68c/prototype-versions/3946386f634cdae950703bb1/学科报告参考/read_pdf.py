import PyPDF2
import os

pdf_dir = r"f:\tmp\学科报告"
files = [
    "学生报告_阶段性测评_11年级数学.pdf",
    "班级报告_阶段性测评_11年级数学.pdf",
    "年级报告_阶段性测评_11年级数学.pdf"
]

for file in files:
    path = os.path.join(pdf_dir, file)
    txt_path = path.replace(".pdf", ".txt")
    if os.path.exists(path):
        print(f"Extracting {file} to txt...")
        try:
            with open(path, "rb") as f, open(txt_path, "w", encoding="utf-8") as out_f:
                reader = PyPDF2.PdfReader(f)
                for p_num, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text:
                        out_f.write(f"--- Page {p_num + 1} ---\n")
                        out_f.write(text + "\n\n")
            print(f"Saved: {txt_path}")
        except Exception as e:
            print(f"Error reading {file}: {e}")
    else:
        print(f"File not found: {path}")
