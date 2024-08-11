export interface ProjectConfig {
	port: number;
	fixtureDirpath: string;
	install(this: ProjectConfig): Promise<void>;
	getStartCommand(this: ProjectConfig): Promise<string>;
}
