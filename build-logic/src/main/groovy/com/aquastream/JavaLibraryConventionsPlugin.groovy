package com.aquastream

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.tasks.compile.JavaCompile
import org.gradle.api.tasks.testing.Test

class JavaLibraryConventionsPlugin implements Plugin<Project> {
    @Override
    void apply(Project project) {
        // Base plugins and dependency management
        project.plugins.apply('java-library')
        project.plugins.apply('io.spring.dependency-management')
        project.plugins.apply('org.owasp.dependencycheck')

        // Java version and compiler options
        project.extensions.configure(org.gradle.api.plugins.JavaPluginExtension) { java ->
            java.sourceCompatibility = org.gradle.api.JavaVersion.VERSION_21
            java.targetCompatibility = org.gradle.api.JavaVersion.VERSION_21
        }

        project.tasks.withType(JavaCompile).configureEach { JavaCompile t ->
            t.options.compilerArgs += ['-parameters', '-Xlint:deprecation', '-Xlint:unchecked']
            t.options.encoding = 'UTF-8'
            t.options.deprecation = true
        }

        // Suppress OpenAPI Generator donation message globally for subprojects
        System.setProperty('org.openapitools.codegen.suppressDonationMessage', 'true')

        // Centralize BOM imports using root properties if present
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

        // Common test configuration
        project.tasks.withType(Test).configureEach { Test test ->
            test.useJUnitPlatform()
            test.testLogging { tl ->
                tl.events 'passed', 'skipped', 'failed'
                tl.showStandardStreams = false
            }
            test.reports { r ->
                r.html.required = true
                r.junitXml.required = true
            }
            def procs = Runtime.runtime.availableProcessors()
            test.maxParallelForks = (procs > 1 ? (procs.intdiv(2) ?: 1) : 1)
        }

        // Optional integration test profile
        def sourceSets = project.extensions.findByName('sourceSets')
        if (sourceSets) {
            def main = sourceSets.getByName('main')
            def itest = sourceSets.findByName('integrationTest') ?: sourceSets.maybeCreate('integrationTest')
            itest.java.srcDir project.file('src/integrationTest/java')
            itest.resources.srcDir project.file('src/integrationTest/resources')
            itest.compileClasspath += main.output + project.configurations.testRuntimeClasspath
            itest.runtimeClasspath += itest.output + itest.compileClasspath
        }

        project.configurations.maybeCreate('integrationTestImplementation').extendsFrom project.configurations.testImplementation
        project.configurations.maybeCreate('integrationTestRuntimeOnly').extendsFrom project.configurations.testRuntimeOnly

        project.tasks.register('integrationTest', Test) { Test t ->
            def ss = project.extensions.findByName('sourceSets')
            def itest = ss?.findByName('integrationTest')
            if (itest) {
                t.description = 'Runs integration tests.'
                t.group = 'verification'
                t.testClassesDirs = itest.output.classesDirs
                t.classpath = itest.runtimeClasspath
            }
            t.useJUnitPlatform()
            t.testLogging { tl ->
                tl.events 'passed', 'skipped', 'failed'
                tl.showStandardStreams = false
            }
            t.reports { r ->
                r.html.required = true
                r.junitXml.required = true
            }
            def procs = Runtime.runtime.availableProcessors()
            t.maxParallelForks = (procs > 1 ? (procs.intdiv(2) ?: 1) : 1)
            t.shouldRunAfter project.tasks.named('test')
        }

        project.tasks.named('check') { it.dependsOn project.tasks.named('integrationTest') }

        // Default dependencies common to all modules
        def junitVersion = (project.findProperty('junitVersion') ?: '5.11.3')
        def lombokVersion = (project.findProperty('lombokVersion') ?: '1.18.34')
        project.dependencies {
            testImplementation platform("org.junit:junit-bom:${junitVersion}")
            testImplementation 'org.junit.jupiter:junit-jupiter'
            testImplementation 'org.testcontainers:junit-jupiter'
            compileOnly "org.projectlombok:lombok:${lombokVersion}"
            annotationProcessor "org.projectlombok:lombok:${lombokVersion}"
        }

        // OWASP Dependency-Check defaults
        project.extensions.configure('dependencyCheck') { dc ->
            dc.formats = ['SARIF', 'HTML']
            dc.outputDirectory = "${project.buildDir}/reports"
            dc.failBuildOnCVSS = 7.0
            dc.suppressionFile = project.rootProject.file('owasp-suppression.xml')
            dc.nvd.apiKey = System.getenv('NVD_API_KEY')
            dc.skip = System.getenv('NVD_API_KEY') == null
        }

        def junitVer = (project.findProperty('junitVersion') ?: '5.10.5')
        def junitPlatformVer = (project.findProperty('junitPlatformVersion') ?: '1.10.5')
        project.configurations.configureEach { cfg ->
            cfg.resolutionStrategy.eachDependency { details ->
                if (details.requested.group == 'org.junit.jupiter') {
                    details.useVersion(junitVer)
                    details.because 'Align JUnit Jupiter artifacts across configurations'
                }
                if (details.requested.group == 'org.junit.platform') {
                    details.useVersion(junitPlatformVer)
                    details.because 'Ensure compatibility with Gradle bundled launcher'
                }
            }
        }
    }
}
