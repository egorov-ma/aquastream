package com.aquastream

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.tasks.compile.JavaCompile

class JavaLibraryConventionsPlugin implements Plugin<Project> {
    @Override
    void apply(Project project) {
        project.plugins.apply('java')
        project.plugins.apply('io.spring.dependency-management')
        project.plugins.apply('org.owasp.dependencycheck')

        project.extensions.configure(org.gradle.api.plugins.JavaPluginExtension) { java ->
            java.sourceCompatibility = org.gradle.api.JavaVersion.VERSION_21
            java.targetCompatibility = org.gradle.api.JavaVersion.VERSION_21
        }

        project.tasks.withType(JavaCompile).configureEach { JavaCompile t ->
            t.options.compilerArgs += ['-parameters', '-Xlint:deprecation', '-Xlint:unchecked']
            t.options.encoding = 'UTF-8'
        }

        project.tasks.matching { it.name == 'test' }.configureEach { test ->
            test.useJUnitPlatform()
            test.testLogging { tl ->
                tl.events 'passed', 'skipped', 'failed'
                tl.showStandardStreams = false
            }
            test.reports { r ->
                r.html.required = true
                r.junitXml.required = true
            }
        }

        // Centralize BOM imports (values taken from root ext properties)
        def bootVer = project.findProperty('springBootVersion')
        def cloudVer = project.findProperty('springCloudVersion')
        def jacksonVer = project.findProperty('jacksonVersion')
        def tcVer = project.findProperty('testcontainersVersion')
        def dmExt = project.extensions.findByName('dependencyManagement')
        if (dmExt) {
            dmExt.imports {
                if (bootVer) mavenBom "org.springframework.boot:spring-boot-dependencies:${bootVer}"
                if (cloudVer) mavenBom "org.springframework.cloud:spring-cloud-dependencies:${cloudVer}"
                if (tcVer) mavenBom "org.testcontainers:testcontainers-bom:${tcVer}"
                if (jacksonVer) mavenBom "com.fasterxml.jackson:jackson-bom:${jacksonVer}"
            }
        }

        // OWASP Dependency-Check defaults
        project.extensions.configure('dependencyCheck') { dc ->
            dc.formats = ['SARIF', 'HTML']
            dc.outputDirectory = "${project.buildDir}/reports"
            dc.failBuildOnCVSS = 7.0
            dc.nvd.apiKey = System.getenv('NVD_API_KEY')
            dc.skip = System.getenv('NVD_API_KEY') == null
        }
    }
}
