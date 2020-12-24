package com.demo;

import org.junit.Rule;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.restdocs.JUnitRestDocumentation;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import com.fasterxml.jackson.databind.ObjectMapper;

@RunWith(SpringRunner.class)
@SpringBootTest
public class DemoApplicationTests {
	
	protected MockMvc mockMvc;
	
	@Rule
    public final JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation();
	
	@Autowired
    private ObjectMapper objectMapper;
	
	@Autowired
	private WebApplicationContext context;
}