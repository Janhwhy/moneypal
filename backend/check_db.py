import sqlite3
c = sqlite3.connect('moneypal.db')
print("Tables:", c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall())
print("Categories:", c.execute("SELECT id, name FROM categories").fetchall())
print("Settings:", c.execute("SELECT * FROM settings").fetchall())
c.close()
