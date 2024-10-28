import { IAPICourse } from "../interfaces/UresiAPI/IAPICourse";
import { IAPIFormEdu } from "../interfaces/UresiAPI/IAPIFormEdu";
import { IAPIFormEduData } from "../interfaces/UresiAPI/IAPIFormEduData";
import { IAPIGroup } from "../interfaces/UresiAPI/IAPIGroup";

export class Schedule {
    private formEduData: IAPIFormEduData;

    private constructor(formEduData: IAPIFormEduData) {
        this.formEduData = formEduData;
    }

    static async fetchFormEduData(apiUrl: string): Promise<Schedule> {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: IAPIFormEduData = await response.json();
            return new Schedule(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    getAllFormsEdu(): IAPIFormEdu[] {
        return this.formEduData.FormEdu;
    }

    getFormEduById(formEduId: number): IAPIFormEdu | undefined {
        return this.formEduData.FormEdu.find(form => form.FormEdu_ID === formEduId);
    }

    getCoursesByFormEduId(formEduId: number): IAPICourse[] | undefined {
        const formEdu = this.getFormEduById(formEduId);
        return formEdu ? formEdu.arr : undefined;
    }

    getGroupsByFormEduIdAndCourse(formEduId: number, courseNumber: number): IAPIGroup[] | undefined {
        const courses = this.getCoursesByFormEduId(formEduId);
        const course = courses?.find(course => course.Curs === courseNumber);
        return course ? course.arr : undefined;
    }

    getGroupById(groupId: number): IAPIGroup | undefined {
        for (const formEdu of this.formEduData.FormEdu) {
            for (const course of formEdu.arr) {
                const group = course.arr.find(group => group.GS_ID === groupId);
                if (group) {
                    return group;
                }
            }
        }
        return undefined;
    }

    getAllGroups(): IAPIGroup[] {
        const groups: IAPIGroup[] = [];
        for (const formEdu of this.formEduData.FormEdu) {
            for (const course of formEdu.arr) {
                groups.push(...course.arr);
            }
        }
        return groups;
    }
}