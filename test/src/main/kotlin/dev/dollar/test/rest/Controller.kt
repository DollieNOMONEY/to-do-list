// package dev.dollar.test.rest
// import org.springframework.http.HttpStatus
// import org.springframework.http.ResponseEntity
// import org.springframework.web.bind.annotation.*
// import java.util.concurrent.atomic.AtomicLong
// import org.springframework.web.bind.annotation.RestController
// import org.springframework.web.bind.annotation.GetMapping
// import org.springframework.web.bind.annotation.PostMapping
// import org.springframework.web.bind.annotation.RequestBody
// import org.springframework.web.bind.annotation.PathVariable
// import org.springframework.web.bind.annotation.PatchMapping
// import org.springframework.web.bind.annotation.PutMapping
// import org.springframework.web.bind.annotation.DeleteMapping

// @RestController
// @CrossOrigin(origins = ["http://localhost:3000"])
// class Controller {

//     private val idCounter = AtomicLong()
//     private val tasks = mutableListOf<Task>().apply {
//         add(Task(id = idCounter.incrementAndGet(), task = "Go outside", isDone = true, dueDate = "Monday", description = "salir now, it's sunny."))
//         add(Task(id = idCounter.incrementAndGet(), task = "Eat dinner", isDone = false, dueDate = "Sunday", description = "salir now, it's sunny."))
//         add(Task(id = idCounter.incrementAndGet(), task = "Do Homework", isDone = false, dueDate = "Today", description = "DO IT NOW!!!"))
//     }
//     // init {
//     //     var newTask = Task(0, "Go outside", true, "Sunday", "salir now, it's sunny.")
//     //     var newTask2 = Task(1, "Eat dinner", false, "Sunday", "salir now, it's sunny.")
//     //     tasks.add(newTask);
//     //     tasks.add(newTask2);
//     // }
    
//     @GetMapping("/api/get-tasks")
//     fun getTasks(): List<Task> {
//         return tasks
//     }

// }

// data class Task(
//     var id: Long = 0,
//     var task: String? = null,
//     var isDone: Boolean? = null,
//     var dueDate: String? = null,
//     var description: String? = null,
// )





package dev.dollar.test.rest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate // For handling YYYY-MM-DD dates
import java.util.concurrent.atomic.AtomicLong

@RestController
@CrossOrigin(origins = ["http://localhost:3000"]) // Ensure this matches your Next.js app's origin
class Controller {

    private val taskIdCounter = AtomicLong()
    private val subtaskIdCounter = AtomicLong() // Counter for subtask IDs

    private val tasks = mutableListOf<Task>().apply {
        add(Task(
            id = taskIdCounter.incrementAndGet(),
            taskName = "Go outside",
            isDone = false, // Changed to false for better demo
            dueDate = LocalDate.now().plusDays(2).toString(), // Example: 2 days from now
            description = "Enjoy the sun!",
            section = "Personal",
            tags = listOf("Important", "Urgent"),
            subTasks = mutableListOf(
                Subtask(id = subtaskIdCounter.incrementAndGet(), title = "Apply sunscreen", completed = false),
                Subtask(id = subtaskIdCounter.incrementAndGet(), title = "Wear hat", completed = true)
            )
        ))
        add(Task(
            id = taskIdCounter.incrementAndGet(),
            taskName = "Eat dinner",
            isDone = false,
            dueDate = LocalDate.now().plusDays(7).toString(), // Example: 1 week from now
            description = "Cook something delicious.",
            section = "Personal",
            tags = listOf("Important"),
            subTasks = mutableListOf()
        ))
        add(Task(
            id = taskIdCounter.incrementAndGet(),
            taskName = "Do Homework",
            isDone = true,
            dueDate = LocalDate.now().minusDays(1).toString(), // Example: Yesterday (overdue but done)
            description = "Finish all assignments before deadline.",
            section = "Work",
            tags = listOf("Pending"),
            subTasks = mutableListOf(
                Subtask(id = subtaskIdCounter.incrementAndGet(), title = "Math exercises", completed = true),
                Subtask(id = subtaskIdCounter.incrementAndGet(), title = "History essay", completed = true)
            )
        ))
    }
    
    // GET all tasks
    @GetMapping("/api/get-tasks")
    fun getTasks(): List<Task> {
        return tasks
    }

    // POST a new task
    @PostMapping("/api/tasks")
    fun createTask(@RequestBody newTask: Task): ResponseEntity<Task> {
        val id = taskIdCounter.incrementAndGet()
        // Assign IDs to new subtasks
        val subtasksWithIds = newTask.subTasks?.map { subtask ->
            subtask.copy(id = subtaskIdCounter.incrementAndGet())
        }?.toMutableList() ?: mutableListOf()

        val taskToSave = newTask.copy(id = id, subTasks = subtasksWithIds)
        tasks.add(taskToSave)
        return ResponseEntity(taskToSave, HttpStatus.CREATED)
    }

    // PUT to update an existing task (full replacement)
    @PutMapping("/api/tasks/{id}")
    fun updateTask(@PathVariable id: Long, @RequestBody updatedTask: Task): ResponseEntity<Task> {
        val index = tasks.indexOfFirst { it.id == id }
        return if (index >= 0) {
            // Re-assign IDs for any *new* subtasks (id=0 from frontend)
            val existingSubtaskIds = tasks[index].subTasks?.map { it.id }?.toSet() ?: emptySet()
            val subtasksWithAssignedIds = updatedTask.subTasks?.map { subtask ->
                if (subtask.id == 0L || subtask.id == null || !existingSubtaskIds.contains(subtask.id)) { // Check for 0L or null for newly added subtasks
                    subtask.copy(id = subtaskIdCounter.incrementAndGet())
                } else {
                    subtask
                }
            }?.toMutableList() ?: mutableListOf()

            val taskToSave = updatedTask.copy(id = id, subTasks = subtasksWithAssignedIds)
            tasks[index] = taskToSave
            ResponseEntity(tasks[index], HttpStatus.OK)
        } else {
            ResponseEntity(HttpStatus.NOT_FOUND)
        }
    }

    // DELETE a task
    @DeleteMapping("/api/tasks/{id}")
    fun deleteTask(@PathVariable id: Long): ResponseEntity<Void> {
        val removed = tasks.removeIf { it.id == id }
        return if (removed) {
            ResponseEntity(HttpStatus.NO_CONTENT)
        } else {
            ResponseEntity(HttpStatus.NOT_FOUND)
        }
    }
}

data class Task(
    var id: Long = 0,
    var taskName: String? = null,
    var isDone: Boolean? = null,
    var dueDate: String? = null, // Stored as YYYY-MM-DD for consistency
    var description: String? = null,
    var section: String? = null,
    var tags: List<String>? = null,
    var subTasks: MutableList<Subtask>? = null
)

data class Subtask(
    var id: Long = 0, // Changed to Long, consistent with Task ID
    var title: String? = null,
    var completed: Boolean? = null
)