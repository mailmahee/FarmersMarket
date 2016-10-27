from django.shortcuts import render, redirect

# Create your views here.
def index(request):
    if 'user' in request.session:
        return redirect('/main')
    else:
        return render(request,'login_reg_app/index.html')

def show_fMarket(request):
    return render(request, 'farmers/index.html')

def localdata(request):
    return render(request, 'farmers/markets.json')
