package com.aquastream

import org.gradle.api.Plugin
import org.gradle.api.Project

class SpringBootApiConventionsPlugin implements Plugin<Project> {
    @Override
    void apply(Project project) {
        project.plugins.apply('org.springframework.boot')
        project.plugins.withId('org.springframework.boot') {
            project.tasks.matching { it.name == 'jar' }.configureEach { it.enabled = false }
            project.tasks.matching { it.name == 'bootJar' }.configureEach { it.enabled = true }
        }
    }
}

