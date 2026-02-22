import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Task = {
    id : Text;
    title : Text;
    description : Text;
    status : TaskStatus;
    dueDate : Int;
    createdAt : Int;
    owner : Principal;
  };

  module Task {
    public func compare(task1 : Task, task2 : Task) : Order.Order {
      Text.compare(task1.title, task2.title);
    };
  };

  type TaskStatus = {
    #pending;
    #inProgress;
    #completed;
  };

  public type UserProfile = {
    name : Text;
  };

  let tasks = Map.empty<Text, Task>();
  let taskIdCounter = Map.empty<Text, Nat>();

  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    Runtime.trap("Profiles not supported in this app.");
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    Runtime.trap("Profiles not supported in this app.");
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    Runtime.trap("Profiles not supported in this app.");
  };

  func getNextTaskId(caller : Principal) : Text {
    let callerText = caller.toText();
    let currentCounter = switch (taskIdCounter.get(callerText)) {
      case (null) { 0 };
      case (?value) { value };
    };
    taskIdCounter.add(callerText, currentCounter + 1);
    let taskId = callerText.concat("_").concat(currentCounter.toText());
    taskId;
  };

  public shared ({ caller }) func createTask(title : Text, description : Text, status : TaskStatus, dueDate : Int) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    let taskId = getNextTaskId(caller);
    let task : Task = {
      id = taskId;
      title;
      description;
      status;
      dueDate;
      createdAt = Time.now();
      owner = caller;
    };
    tasks.add(taskId, task);
    task;
  };

  public shared ({ caller }) func updateTask(taskId : Text, title : Text, description : Text, status : TaskStatus, dueDate : Int) : async Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    let existingTask = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    if (existingTask.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or an admin can update this task");
    };

    let updatedTask : Task = {
      existingTask with
      title;
      description;
      status;
      dueDate;
    };
    tasks.add(taskId, updatedTask);
    updatedTask;
  };

  public shared ({ caller }) func deleteTask(taskId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    let existingTask = switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };

    if (existingTask.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the owner or an admin can delete this task");
    };

    tasks.remove(taskId);
  };

  public query ({ caller }) func getTasksByStatus(status : TaskStatus) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    let filteredIter = tasks.values().filter(
      func(task) { task.status == status and task.owner == caller }
    );
    filteredIter.toArray().sort();
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };

    // Users can only see their own tasks, admins can see all tasks
    if (AccessControl.isAdmin(accessControlState, caller)) {
      tasks.values().toArray().sort();
    } else {
      let filteredIter = tasks.values().filter(
        func(task) { task.owner == caller }
      );
      filteredIter.toArray().sort();
    };
  };
};
