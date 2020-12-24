package com.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class MainController {
	
	/**
	 * 대화
	 * @return
	 */
	@RequestMapping({"/", "/chat"})
	public String chat() {
		return "/rtc_test/chat";
	}
	
	/**
	 * 화상 회의
	 * @return
	 */
	@RequestMapping("/video")
	public String video() {
		return "/rtc_test/video";
	}
	
	/**
	 * 화면공유
	 * @return
	 */
	@RequestMapping("/display")
	public String display() {
		return "/rtc_test/display";
	}
	
	/**
	 * 파일공유
	 * @return
	 */
	@RequestMapping("/file")
	public String file() {
		return "/rtc_test/file";
	}
}
