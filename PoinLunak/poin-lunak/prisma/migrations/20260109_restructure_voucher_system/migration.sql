-- Restructure rewards table for new voucher system
-- rewards table: stores vouchers that members have exchanged from points

-- First, drop the old rewards table and foreign keys
DROP TABLE IF EXISTS `rewards`;

-- Recreate rewards table with new structure
CREATE TABLE `rewards` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reward_item_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  `code` VARCHAR(191) NOT NULL UNIQUE,
  `status` VARCHAR(191) DEFAULT 'ACTIVE',
  `exchanged_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expires_at` DATETIME(3) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`reward_item_id`) REFERENCES `reward_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update redemption_history structure
-- First add the new columns
ALTER TABLE `redemption_history` ADD COLUMN `rewards_id` INT;
ALTER TABLE `redemption_history` ADD COLUMN `transaction_ref` VARCHAR(191);

-- Drop old foreign key and column
ALTER TABLE `redemption_history` DROP FOREIGN KEY `redemption_history_reward_item_id_fkey`;
ALTER TABLE `redemption_history` DROP COLUMN `reward_item_id`;

-- Add foreign key for the new rewards_id column
ALTER TABLE `redemption_history` ADD CONSTRAINT `redemption_history_rewards_id_fkey` 
  FOREIGN KEY (`rewards_id`) REFERENCES `rewards`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

