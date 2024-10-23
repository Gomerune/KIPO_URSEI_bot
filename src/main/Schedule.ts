export class Schedule {
    private formEduData: FormEduData;

    private constructor(formEduData: FormEduData) {
        this.formEduData = formEduData;
    }

    // Статический метод для получения данных из API
    static async fetchFormEduData(apiUrl: string): Promise<Schedule> {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: FormEduData = await response.json();
            return new Schedule(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    // Метод для получения всех форм обучения
    getAllFormsEdu(): FormEdu[] {
        return this.formEduData.FormEdu;
    }

    // Метод для получения формы обучения по ID
    getFormEduById(formEduId: number): FormEdu | undefined {
        return this.formEduData.FormEdu.find(form => form.FormEdu_ID === formEduId);
    }

    // Метод для получения всех курсов для определенной формы обучения
    getCoursesByFormEduId(formEduId: number): Course[] | undefined {
        const formEdu = this.getFormEduById(formEduId);
        return formEdu ? formEdu.arr : undefined;
    }

    // Метод для получения всех групп для определенного курса и формы обучения
    getGroupsByFormEduIdAndCourse(formEduId: number, courseNumber: number): Group[] | undefined {
        const courses = this.getCoursesByFormEduId(formEduId);
        const course = courses?.find(course => course.Curs === courseNumber);
        return course ? course.arr : undefined;
    }

    // Метод для получения группы по ID группы
    getGroupById(groupId: number): Group | undefined {
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

    // Метод для получения всех групп
    getAllGroups(): Group[] {
        const groups: Group[] = [];
        for (const formEdu of this.formEduData.FormEdu) {
            for (const course of formEdu.arr) {
                groups.push(...course.arr);
            }
        }
        return groups;
    }
}