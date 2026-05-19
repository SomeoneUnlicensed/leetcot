package main

import (
	"sync"
)

// FeedCats simulates feeding cats using goroutines and channels
// Each cat gets fed by workers processing from a shared channel
func FeedCats(catNames []string, workersCount int) map[string]bool {
	result := make(map[string]bool)
	resultMutex := sync.Mutex{}
	
	// Create a channel for cat names
	catChannel := make(chan string, workersCount)
	
	// Create a WaitGroup to synchronize all workers
	var wg sync.WaitGroup
	
	// Start worker goroutines
	for i := 0; i < workersCount; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			
			// Each worker processes cats from the channel
			for catName := range catChannel {
				// Mark cat as fed
				resultMutex.Lock()
				result[catName] = true
				resultMutex.Unlock()
			}
		}()
	}
	
	// Send cat names to the channel
	go func() {
		for _, name := range catNames {
			catChannel <- name
		}
		close(catChannel)
	}()
	
	// Wait for all workers to finish
	wg.Wait()
	
	return result
}
