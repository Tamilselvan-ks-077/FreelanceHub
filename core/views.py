from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Student

def home(request):
    if request.method == "POST":
        name = request.POST.get("name")
        age = request.POST.get("age")
        email = request.POST.get("email")
        
        if name and age and email:
            try:
                Student.objects.create(name=name, age=int(age), email=email)
                messages.success(request, f"Successfully registered {name}!")
            except Exception as e:
                messages.error(request, f"Error registering student: {str(e)}")
        else:
            messages.error(request, "Please fill in all fields.")
        return redirect("home")
        
    students = Student.objects.all().order_by("-id")
    return render(request, "core/home.html", {"students": students})
