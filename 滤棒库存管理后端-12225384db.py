# 导入必要的库
import pyodbc
from datetime import datetime

# 数据库连接配置
SERVER = 'localhost'  # SQL Server服务器地址
DATABASE = 'FilterRodInventory'  # 数据库名称
USERNAME = 'sa'  # 用户名
PASSWORD = 'your_password'  # 密码

# 建立数据库连接
def get_db_connection():
    try:
        conn = pyodbc.connect(
            f'DRIVER={{ODBC Driver 18 for SQL Server}};SERVER={SERVER};DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}'
        )
        return conn
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return None

# 创建入库记录表
def create_inbound_table():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            # 检查表是否存在，如果不存在则创建
            cursor.execute("""
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InboundRecords')
                CREATE TABLE InboundRecords (
                    ID INT IDENTITY(1,1) PRIMARY KEY,
                    QRCode VARCHAR(100) NOT NULL,
                    Specification VARCHAR(50),
                    RodCount INT NOT NULL,
                    InboundDate DATETIME NOT NULL,
                    CreateTime DATETIME DEFAULT GETDATE()
                )
            """)
            conn.commit()
            print("入库记录表已创建或已存在")
        except Exception as e:
            print(f"创建表失败: {e}")
        finally:
            conn.close()

# 添加入库记录
def add_inbound_record(qr_code, specification, rod_count, inbound_date):
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            # 插入新记录
            cursor.execute("""
                INSERT INTO InboundRecords (QRCode, Specification, RodCount, InboundDate)
                VALUES (?, ?, ?, ?)
            """, (qr_code, specification, rod_count, inbound_date))
            conn.commit()
            print(f"成功添加入库记录: QR码={qr_code}, 规格={specification}, 格数={rod_count}, 入库日期={inbound_date}")
            return True
        except Exception as e:
            print(f"添加入库记录失败: {e}")
            return False
        finally:
            conn.close()

# 获取入库记录
def get_inbound_records():
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM InboundRecords ORDER BY InboundDate DESC")
            records = cursor.fetchall()
            
            # 准备输出文本
            result_text = "滤棒入库记录:\n"
            result_text += "========================================\n"
            
            for record in records:
                result_text += f"ID: {record.ID}\n"
                result_text += f"QR码: {record.QRCode}\n"
                result_text += f"规格: {record.Specification}\n"
                result_text += f"格数: {record.RodCount}\n"
                result_text += f"入库日期: {record.InboundDate}\n"
                result_text += f"创建时间: {record.CreateTime}\n"
                result_text += "----------------------------------------\n"
            
            # 添加统计信息
            cursor.execute("SELECT COUNT(*) FROM InboundRecords")
            total_count = cursor.fetchone()[0]
            result_text += f"总记录数: {total_count}\n"
            
            # 保存结果到文件
            output_file_name = "滤棒入库记录_" + datetime.now().strftime("%Y%m%d%H%M%S") + ".txt"
            with open(output_file_name, 'w', encoding='utf-8') as file:
                file.write(result_text)
            
            print(f"文件 {output_file_name} 已成功保存。")
            return True
        except Exception as e:
            print(f"获取入库记录失败: {e}")
            return False
        finally:
            conn.close()

# 主函数
def main():
    # 创建表
    create_inbound_table()
    
    # 示例数据 - 添加入库记录
    # 在实际应用中，这些数据应该来自手机端扫码后的输入
    add_inbound_record("QR123456", "A型滤棒", 100, "2025-05-07 10:00:00")
    add_inbound_record("QR789012", "B型滤棒", 150, "2025-05-07 11:30:00")
    
    # 获取并显示所有入库记录
    get_inbound_records()

if __name__ == "__main__":
    main()