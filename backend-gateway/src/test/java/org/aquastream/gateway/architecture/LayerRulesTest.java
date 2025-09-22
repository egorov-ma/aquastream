package org.aquastream.gateway.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

public class LayerRulesTest {
    @Test
    void gateway_should_not_depend_on_db_packages() {
        JavaClasses classes = new ClassFileImporter().importPackages("org.aquastream");
        ArchRule rule = noClasses().that().resideInAPackage("..gateway..").should()
                .dependOnClassesThat().resideInAPackage("..db..");
        rule.check(classes);
    }
}

