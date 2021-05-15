package com.hoaxify.hoaxify;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.hoaxify.hoaxify.configuration.AppConfiguration;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class StaticResourceTest {

	@Autowired
	AppConfiguration appConfiguration;

	@Autowired
	MockMvc mockMvc;

	@Test
	public void checkStaticFolde_whenAppIsInitialized_uploadFolderMustExist() {
		File uploadFolder = new File(appConfiguration.getUploadPath());
		boolean uploadFolderExist = uploadFolder.exists() && uploadFolder.isDirectory();
		assertThat(uploadFolderExist).isTrue();
	}

	@Test
	public void checkStaticFolder_whenAppIsInitialized_profileImageSubFolderMustExist() {
		String profileImageFolderPath = appConfiguration.getFullProfileImagesPath();
		File profileImageFolder = new File(profileImageFolderPath);
		boolean profileImageFolderExist = profileImageFolder.exists() && profileImageFolder.isDirectory();
		assertThat(profileImageFolderExist).isTrue();
	}

	@Test
	public void checkStaticFolder_whenAppIsInitialized_attachmentsSubFolderMustExist() {
		String attachmentsFolderPath = appConfiguration.getFullAttachmentsPath();
		File attachmentsFolder = new File(attachmentsFolderPath);
		boolean attachmentsFolderExist = attachmentsFolder.exists() && attachmentsFolder.isDirectory();
		assertThat(attachmentsFolderExist).isTrue();
	}

	@Test
	public void getStaticFile_whenImageExistInProfileUploadFolder_receiveOk() throws Exception {
		String fileName = "profile-picture.png";
		File source = new ClassPathResource("profile.png").getFile();

		File target = new File(appConfiguration.getFullProfileImagesPath().concat("/").concat(fileName));
		FileUtils.copyFile(source, target);

		mockMvc.perform(
				get("/images/".concat(appConfiguration.getFullProfileImagesFolder().concat("/").concat(fileName))))
				.andExpect(status().isOk());
	}

	@Test
	public void getStaticFile_whenImageExistInAttachmentFolder_receiveOk() throws Exception {
		String fileName = "profile-picture.png";
		File source = new ClassPathResource("profile.png").getFile();

		File target = new File(appConfiguration.getFullAttachmentsPath().concat("/").concat(fileName));
		FileUtils.copyFile(source, target);

		mockMvc.perform(get("/images/".concat(appConfiguration.getAttachmentsFolder().concat("/").concat(fileName))))
				.andExpect(status().isOk());
	}

	@Test
	public void getStaticFile_whenImageDoesNotExist_receiveNotFound() throws Exception {
		mockMvc.perform(
				get("/images/".concat(appConfiguration.getAttachmentsFolder()).concat("there-is-no-such-image.png")))
				.andExpect(status().isNotFound());
	}

	@Test
	public void getStaticFile_whenImageExistInAttachmentFolder_receiveOkWithCacheHeaders() throws Exception {
		Integer yearInSeconds = 31536000;
		String maxAge = "max-age=".concat(yearInSeconds.toString());
		String fileName = "profile-picture.png";
		File source = new ClassPathResource("profile.png").getFile();

		File target = new File(appConfiguration.getFullAttachmentsPath() + "/" + fileName);
		FileUtils.copyFile(source, target);

		MvcResult result = mockMvc
				.perform(get("/images/".concat(appConfiguration.getAttachmentsFolder()).concat("/").concat(fileName)))
				.andReturn();

		String cacheControl = result.getResponse().getHeaderValue("Cache-Control").toString();
		assertThat(cacheControl).contains(maxAge);
	}

	@After
	public void cleanup() throws IOException {
		FileUtils.cleanDirectory(new File(appConfiguration.getFullProfileImagesPath()));
	}
}
