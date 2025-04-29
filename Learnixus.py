import json
import re


def load_data():
    try:
        with open('data.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        return {"subjects": []}
    
def save_data(data):
    with open('data.json', 'w') as file:
        json.dump(data, file, indent=4)

def add_subject(data,subject_name):
    data['subjects'].append({'name':subject_name, 'chapters':[]})
    save_data(data)
    print(f"Subject '{subject_name}' added successfully.")
    
def view_subjects(data):
    if len(data['subjects']) == 0:
        print("No subjects available.")
    else:
        print("Available subjects:")
        for idx, subject in enumerate(data['subjects'], 1):
            print(f"{idx}. {subject['name']}")
            
def add_chapter(data,chapter_name,subject_name):
    subject = next((s for s in data['subjects'] if s['name'].lower() == subject_name.lower()), None)
    if not subject:
        print(f"Subject '{subject_name}' not found.")
        return
    
    subject['chapters'].append({'name':chapter_name,'status':'not started'})
    save_data(data)
    print(f'chapter{chapter_name} added to {subject["name"]} successfully.')


def update_chapter_status(data,subject_name,chapter_name,new_status):
    subject = next((s for s in data['subjects'] if s['name'].lower() == subject_name.lower()), None)
    if not subject:
        print(f"Subject '{subject_name}' not found.")
        return
    
    chapter = next((c for c in subject['chapters'] if c['name'].lower() == chapter_name.lower()), None)
    if not chapter:
        print(f"Chapter '{chapter_name}' not found in '{subject_name}'.")
        return
    
    if new_status not in ['not started', 'in progress', 'completed']:
        print("Invalid status. Please use 'not started', 'in progress', or 'completed'.")
        return
    
    chapter['status'] = new_status
    save_data(data)
    print(f"Chapter '{chapter_name}' in '{subject_name}' updated to {new_status}.")

def get_progress_report(data, subject_name = None):
    if not data["subjects"]:
        print("No subjects found.")
        return

    for subject in data["subjects"]:
        if subject_name and subject["name"].lower() != subject_name.lower():
            continue

        total = len(subject["chapters"])
        completed = sum(1 for ch in subject["chapters"] if ch["status"] == "Completed")
        percent = (completed / total * 100) if total > 0 else 0
        print(f'{subject["name"]}: {percent:.1f}% completed')

        if subject_name:
            return  


def parse_command(command,data):
   match = re.search(r'add subject (\w+)', command.lower())
   if match:
       subject_name = match.group(1)
       add_subject(data,subject_name)
       return 
   
   if command.lower().startswith('view subjects'):
       view_subjects(data)
       return
   

   match = re.search(r'add chapter (\w+) to (\w+)', command.lower())
   if match:
       chapter_name = match.group(1)
       subject_name = match.group(2)
       add_chapter(data,chapter_name,subject_name)
       return
   
   
   match = re.search(r'update chapter (\w+) in (\w+) to (\w+)', command.lower())
   if match:
        chapter_name = match.group(1)
        subject_name = match.group(2)
        new_status = match.group(3)
        update_chapter_status(data,subject_name,chapter_name,new_status)
        return
   
   match = re.search(r'progress report (\w+)',command.lower())
   if match:
       subject_name = match.group(1)
       get_progress_report(data, subject_name)

print('sorry, I did not understand the command.')

#main
def main():
    data = load_data()  
    print("\nwelcome to Learnixus📚✨")
    
    while True:
        command = input("Enter a command: ")
        if command.lower() == 'exit':
            print("Exiting the program...")
            break
        
        parse_command(command,data)

#run program
if __name__ == "__main__":
    main()



                
            
            
