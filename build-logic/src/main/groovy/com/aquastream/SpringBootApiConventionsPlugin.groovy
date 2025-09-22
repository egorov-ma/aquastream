package com.aquastream

import org.gradle.api.Plugin
import org.gradle.api.Project

class SpringBootApiConventionsPlugin implements Plugin<Project> {
    @Override
    void apply(Project project) {
        project.plugins.apply('org.springframework.boot')
        // Executable modules should build bootJar by default
        project.plugins.withId('org.springframework.boot') {
            project.tasks.named('jar').configure { it.enabled = false }
            project.tasks.named('bootJar').configure { it.enabled = true }
        }
    }
}

