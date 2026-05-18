import (
	"sync"
)

func FeedCats(catNames []string, workersCount int) map[string]bool {
	results := make(map[string]bool)
	var mu sync.Mutex
	var wg sync.WaitGroup

	jobs := make(chan string, len(catNames))

	// Запускаем воркеров
	for w := 1; w <= workersCount; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for cat := range jobs {
				// "Кормим" кота
				mu.Lock()
				results[cat] = true
				mu.Unlock()
			}
		}()
	}

	// Отправляем задачи
	for _, name := range catNames {
		jobs <- name
	}
	close(jobs)

	// Ждем завершения
	wg.Wait()

	return results
}
