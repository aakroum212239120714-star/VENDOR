CREATE TABLE IF NOT EXISTS conversation_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(50) NOT NULL,
  store_id INT NOT NULL,
  context_json JSON NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_chat (phone_number, store_id)
);
