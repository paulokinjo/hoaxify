package com.hoaxify.hoaxify.user;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hoaxify.hoaxify.error.NotFoundException;

@Service
public class UserService {

	UserRepository userRepository;

	PasswordEncoder passwordEncoder;

	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		super();
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public User save(User user) {
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		return userRepository.save(user);
	}
<<<<<<< HEAD
=======

	public Page<User> getUsers(User loggeInUser, Pageable page) {
		if(loggeInUser != null) {
			return userRepository.findByUsernameNot(loggeInUser.getUsername(), page);
		}
		return userRepository.findAll(page);		
	}

	public User getByUsername(String username) {
		User inDB = userRepository.findByUsername(username);
		if(inDB == null) {
			throw new NotFoundException(username + " not found");
		}
		
		return inDB;
	}
>>>>>>> 37f9ca95a8fef0f63ce300a9530e31f10492e245
}
