package com.hoaxify.hoaxify.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "hoaxify")
public class AppConfiguration {

	String uploadPath;
	String fullProfileImagesFolder = "profile";
	String attachmentsFolder = "attachments";
	
	public String getFullProfileImagesPath() {
		return this.uploadPath + "/" + this.fullProfileImagesFolder;
	}
	
	public String getFullAttachmentsPath() {
		return this.uploadPath + "/" + this.attachmentsFolder;
	}
}
