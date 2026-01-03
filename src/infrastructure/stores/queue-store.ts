import type { QueueRepository, QueueTask } from 'orgnote-api';
import type { Store } from 'better-queue';
import { isNullable } from 'orgnote-api/utils';
import { to } from 'orgnote-api/utils';

interface IncomingTask {
  payload: unknown;
}

const safeClone = (value: unknown): unknown => {
  if (isNullable(value)) return value;
  if (typeof value !== 'object') return value;

  const structuredResult = to(() => structuredClone(value))();
  if (structuredResult.isOk()) return structuredResult.value;

  const jsonResult = to(() => JSON.parse(JSON.stringify(value)) as unknown)();
  if (jsonResult.isOk()) return jsonResult.value;

  return value;
};

export class QueueStore implements Store<unknown> {
  private readonly repo: QueueRepository;
  private readonly queueName: string;

  constructor(repo: QueueRepository, queueName = 'default') {
    this.repo = repo;
    this.queueName = queueName;
  }

  connect(cb: (err: unknown, length: number) => void) {
    this.repo
      .getAll(this.queueName)
      .then((tasks) => {
        const pendingCount = tasks.filter((t) => t.status === 'pending').length;
        cb(null, pendingCount);
      })
      .catch((err) => cb(err, 0));
  }

  getTask(taskId: string, cb: (err: unknown, task?: unknown) => void) {
    this.repo
      .get(taskId)
      .then((task) => {
        if (!task) {
          cb(null, undefined);
          return;
        }
        cb(null, task);
      })
      .catch((err) => cb(err));
  }

  getAll(cb: (err: unknown, tasks: QueueTask[]) => void) {
    this.repo
      .getAll(this.queueName)
      .then((tasks) => cb(null, tasks))
      .catch((err) => cb(err, []));
  }

  putTask(
    taskId: string,
    task: IncomingTask | undefined,
    _priority: number,
    cb: (err: unknown) => void,
  ) {
    if (!task) {
      cb(new Error(`putTask called with undefined task for id: ${taskId}`));
      return;
    }

    const payload = safeClone(task.payload);

    const queueTask: QueueTask = {
      id: taskId,
      payload,
      added: Date.now(),
      queueId: this.queueName,
    };

    this.repo
      .add(queueTask)
      .then(() => cb(null))
      .catch((err) => cb(err));
  }

  takeFirstN(n: number, cb: (err: unknown, lockId: string) => void) {
    this.repo
      .takeFirstN(n, this.queueName)
      .then((lockId) => cb(null, lockId))
      .catch((err) => cb(err, ''));
  }

  getLock(lockId: string, cb: (err: unknown, tasks: { [id: string]: unknown }) => void) {
    this.repo
      .getLock(lockId)
      .then((tasks) => {
        if (!tasks) {
          cb(null, {});
          return;
        }

        cb(null, tasks);
      })
      .catch((err) => cb(err, {}));
  }

  deleteTask(taskId: string, cb: (err: unknown) => void) {
    this.repo
      .delete(taskId)
      .then(() => cb(null))
      .catch((err) => cb(err));
  }

  releaseLock(lockId: string, cb: (err: unknown) => void) {
    this.repo
      .getLock(lockId)
      .then((tasks) => {
        if (!tasks) {
          cb(null);
          return;
        }

        const promises = Object.values(tasks).map((t) => this.repo.release(t.id));
        return Promise.all(promises).then(() => cb(null));
      })
      .catch((err) => cb(err));
  }

  getRunningTasks(cb: (err: unknown, tasks: { [id: string]: QueueTask }) => void) {
    this.repo
      .getRunningTasks(this.queueName)
      .then((tasks) => {
        cb(null, tasks);
      })
      .catch((err) => cb(err, {}));
  }

  takeLastN(_n: number, cb: (err: unknown, lockId: string) => void) {
    cb(null, '');
  }
}
