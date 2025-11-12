import qrcode

print("enter the format of file you want to generate as qr code :\n1.text file \n2.url \n3.files in google drive")
inp=input("enter the option number 1/2/3:")

if inp=='1':
    text_file=input("enter the text file path but without double qoutes on both ends:")
    save_name=input("enter the name to save your qr code iamge without typing .png:")
    save_path=f"C:\\Users\\dell\\Desktop\\qr code genarator by ak\\{save_name}.png"
    with open(text_file,'r') as file:
        data=file.read()
    img =qrcode.make(data)
    img.save(save_path)
    print("u r qrocde is genrated ")
elif inp=='2':
    print("i am still working on it bro :(")
elif inp=='3':
    print("i am still working on it bro :(")


