export class DateValueConverter {
    toView (date: string): string {
        let dateAsDate = new Date(date)
        return dateAsDate.toLocaleString()
    }
}