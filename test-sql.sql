-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema db_PointLunak
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `db_PointLunak` ;

-- -----------------------------------------------------
-- Schema db_PointLunak
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `db_PointLunak` DEFAULT CHARACTER SET utf8mb4 ;
USE `db_PointLunak` ;

-- -----------------------------------------------------
-- Table `db_PointLunak`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_PointLunak`.`users` ;

CREATE TABLE IF NOT EXISTS `db_PointLunak`.`users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(20) NULL DEFAULT NULL,
  `address` TEXT NULL DEFAULT NULL,
  `join_date` DATE NULL DEFAULT NULL,
  `points` INT(11) NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `db_PointLunak`.`membership_logs`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_PointLunak`.`membership_logs` ;

CREATE TABLE IF NOT EXISTS `db_PointLunak`.`membership_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `activity` VARCHAR(255) NULL DEFAULT NULL,
  `activity_time` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(),
  `users_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`, `users_id`),
  CONSTRAINT `fk_membership_logs_members1`
    FOREIGN KEY (`users_id`)
    REFERENCES `db_PointLunak`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

CREATE INDEX `fk_membership_logs_members1_idx` ON `db_PointLunak`.`membership_logs` (`users_id` ASC);


-- -----------------------------------------------------
-- Table `db_PointLunak`.`rewards`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_PointLunak`.`rewards` ;

CREATE TABLE IF NOT EXISTS `db_PointLunak`.`rewards` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `reward_name` VARCHAR(100) NULL DEFAULT NULL,
  `points_required` INT(11) NULL DEFAULT NULL,
  `redeemed_at` DATETIME NULL DEFAULT NULL,
  `status` VARCHAR(20) NULL DEFAULT NULL,
  `code` VARCHAR(500) NULL,
  `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(),
  `users_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`, `users_id`),
  CONSTRAINT `fk_rewards_members`
    FOREIGN KEY (`users_id`)
    REFERENCES `db_PointLunak`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4;

CREATE INDEX `fk_rewards_members_idx` ON `db_PointLunak`.`rewards` (`users_id` ASC);


-- -----------------------------------------------------
-- Table `db_PointLunak`.`transactions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `db_PointLunak`.`transactions` ;

CREATE TABLE IF NOT EXISTS `db_PointLunak`.`transactions` (
  `id` INT(11) NOT NULL,
  `total_item` INT NULL,
  `total_transaction` DECIMAL(10,2) NULL,
  `items` VARCHAR(500) NULL,
  `points_gained` INT NULL,
  `created_at` DATETIME NULL,
  `users_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`, `users_id`),
  CONSTRAINT `fk_transaction_members1`
    FOREIGN KEY (`users_id`)
    REFERENCES `db_PointLunak`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_transaction_members1_idx` ON `db_PointLunak`.`transactions` (`users_id` ASC);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
