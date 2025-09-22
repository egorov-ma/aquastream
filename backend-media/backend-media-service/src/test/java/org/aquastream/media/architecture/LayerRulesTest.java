package org.aquastream.media.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

public class LayerRulesTest {
    @Test
    void service_should_not_depend_on_api() {
        JavaClasses classes = new ClassFileImporter().importPackages("org.aquastream.media");
        ArchRule rule = noClasses().that().resideInAPackage("..service..")
                .and().haveNameNotMatching(".*Test.*") // exclude test classes
                .should().dependOnClassesThat().resideInAPackage("..api..");
        rule.check(classes);
    }
}

