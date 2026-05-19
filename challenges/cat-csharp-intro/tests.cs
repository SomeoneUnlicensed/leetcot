using Xunit;

public class CatTests
{
    [Fact]
    public void TestMeow()
    {
        var cat = new Cat("Барсик");
        Assert.Equal("Мяу, Барсик!", cat.Meow());
    }

    [Fact]
    public void TestGreet()
    {
        var cat = new Cat("Барсик");
        Assert.Equal("Барсик говорит привет Пушок!", cat.Greet("Пушок"));
    }
}
