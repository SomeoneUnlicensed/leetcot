import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CatTest {
    @Test
    public void testMeow() {
        Cat cat = new Cat("Барсик");
        assertEquals("Мяу, Барсик!", cat.meow());
    }
    
    @Test
    public void testGreet() {
        Cat cat = new Cat("Барсик");
        assertEquals("Барсик говорит привет Пушок!", cat.greet("Пушок"));
    }
}
