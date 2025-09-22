package com.aquastream

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.tasks.compile.JavaCompile

class JavaLibraryConventionsPlugin implements Plugin<Project> {
    @Override
    void apply(Project project) {
        project.plugins.apply('java-library')

        project.extensions.configure(org.gradle.api.plugins.JavaPluginExtension) { java ->
            java.sourceCompatibility = org.gradle.api.JavaVersion.VERSION_21
            java.targetCompatibility = org.gradle.api.JavaVersion.VERSION_21
        }

        project.tasks.withType(JavaCompile).configureEach { JavaCompile t ->
            t.options.compilerArgs += ['-parameters', '-Xlint:deprecation', '-Xlint:unchecked']
            t.options.encoding = 'UTF-8'
        }

        project.tasks.named('test').configure { test ->
            test.useJUnitPlatform()
            test.testLogging { tl ->
                tl.events 'passed', 'skipped', 'failed'
                tl.showStandardStreams = false
            }
        }
    }
}
