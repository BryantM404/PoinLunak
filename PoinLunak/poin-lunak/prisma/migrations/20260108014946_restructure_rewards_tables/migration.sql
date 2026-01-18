-- DropForeignKey
ALTER TABLE `redemption_history` DROP FOREIGN KEY `redemption_history_ibfk_1`;

-- DropForeignKey
ALTER TABLE `redemption_history` DROP FOREIGN KEY `redemption_history_ibfk_2`;

-- AddForeignKey
ALTER TABLE `redemption_history` ADD CONSTRAINT `redemption_history_users_id_fkey` FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `redemption_history` ADD CONSTRAINT `redemption_history_reward_item_id_fkey` FOREIGN KEY (`reward_item_id`) REFERENCES `reward_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
