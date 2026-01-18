-- CreateTable reward_items
-- This table stores the reward items that can be redeemed by members
CREATE TABLE `reward_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191),
    `points_required` INTEGER NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `validity_days` INTEGER NOT NULL DEFAULT 30,
    `status` VARCHAR(191) DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable redemption_history
-- This table stores the history of when members redeem rewards
CREATE TABLE `redemption_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `users_id` INTEGER NOT NULL,
    `reward_item_id` INTEGER NOT NULL,
    `redeemed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) DEFAULT 'COMPLETED',
    `code` VARCHAR(191),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`reward_item_id`) REFERENCES `reward_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- The old rewards table is kept for backward compatibility
-- No changes made to the existing rewards table structure
