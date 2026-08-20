# مفتاح العقارات (Real Estate Key)

Build a Property Management System for real estate offices, structured around 

Workspaces with role-based access. This is an internal tool used only by office 

staff — not client-facing.

Core Concept

Each real estate office gets its own isolated Workspace. The office owner creates 

the workspace and gets a unique Workspace Code. Staff join that specific workspace 

using the code + a password. There are two roles with different permissions: 

Manager and Employee. This must be fully multi-tenant — one office's data should 

never be visible to another office's workspace.

Authentication & Workspace Access Flow

Creating a Workspace

- When a new office signs up, they create a Workspace: choose a Workspace Name, 

  and the system generates a unique Workspace Code (short, easy to share verbally 

  or by text — e.g. 6 characters, letters+numbers)

- During setup, the owner sets TWO separate passwords for that workspace:

  1. Manager Password

  2. Employee Password

- The owner also enters their own name/info as the first Manager user

Logging In (for all subsequent users)

- Login screen asks for: Workspace Code, then Password

- The system checks the password against both stored passwords for that workspace code:

  - If it matches the Manager Password → log in with Manager role

  - If it matches the Employee Password → log in with Employee role

  - If it matches neither → show invalid password error

- No separate username/email needed per employee — the role is entirely determined 

  by WHICH password was entered. This means the office owner can just verbally give 

  new hires "the employee password" and the workspace code, no per-person account 

  setup needed

- Optionally ask for a display name at login (so activity logs can show "added by 

  Ahmad") even though there's no individual account — store this as a session-level 

  name tied to that login, not a full user account

Role Permissions (critical — must be enforced both in UI and backend)

Manager role can:

- View all properties

- Add new properties (full Add Property page)

- Edit any property

- Delete any property

- Access Settings page (change workspace name, change Manager/Employee passwords, 

  view/manage workspace info)

- View all activity/changes across the workspace

Employee role can ONLY:

- View the list of properties (read-only)

- View individual property details (read-only)

- Search/filter properties

- CANNOT see or access the Settings page at all — this nav item/route must not 

  even appear or be reachable for Employee role, not just hidden but actually 

  blocked at the route/permission level

- CANNOT see or access the Add Property page — same, must not appear in navigation 

  and must be blocked if the URL is accessed directly

- CANNOT edit any property fields

- CANNOT delete any property

- Basically Employee = view-only access to the property list, nothing else

This permission check must happen on the backend/database level (not just hiding 

UI buttons), so an employee can't bypass restrictions by manipulating the frontend 

or guessing a URL.

Data Model

Workspace:

- Workspace name

- Workspace code (unique, auto-generated)

- Manager password (hashed)

- Employee password (hashed)

- Created date

Property (belongs to a Workspace):

- Title/reference name

- Type: Apartment / House / Land / Shop / Office

- Status: Available / Sold / Rented / Reserved

- Price

- Area/neighborhood/city

- Number of rooms (if applicable)

- Size (m²)

- Owner's name and contact info (property owner, not the office)

- Photos (multiple image upload)

- Description/notes field

- Date added

- Last updated date + who updated it (display name from session)

Core Pages

1. Login Page — Workspace Code + Password fields, clean and simple

2. Property List Page (both roles see this, it's the default landing page 

   after login) — grid or list view of all properties in the workspace, with 

   filters (status, type, area, price range) and search

3. Property Detail Page — full info + photos for one property. Manager sees 

   Edit/Delete buttons here, Employee does not

4. Add Property Page — Manager only, form to add a new property with all 

   fields above

5. Edit Property Page — Manager only, same form pre-filled, editable

6. Settings Page — Manager only: 

   - View/copy workspace code (to share with new employees)

   - Change Manager password

   - Change Employee password

   - Change workspace name

Design & UX Requirements

- Interface in Arabic, right-to-left (RTL) layout

- Clean and simple — used by non-technical staff on both desktop and mobile

- After login, clearly show which role the user is in (small badge/label like 

  "مدير" or "موظف") so it's obvious what mode they're in

- Mobile-friendly, since staff will often check listings from their phone while 

  out with clients

Technical Notes

- Use Supabase (or Lovable's built-in backend) for database, auth, and file 

  storage (for property photos)

- Passwords must be hashed, never stored in plain text

- Enforce workspace data isolation: a query must always be scoped to the current 

  workspace — one office must NEVER be able to see another office's properties, 

  even by accident or URL manipulation

- Enforce role permissions at the database/API level using row-level security or 

  equivalent, not just frontend conditionals

What NOT to include (out of scope for this version)

- No public-facing website or listing pages for clients

- No payment processing

- No individual employee accounts/emails — role is determined purely by which 

  shared password was used, as described above

- No lead/client tracking (that may be a separate future system)

Build this as a clean, functional MVP. Prioritize: workspace creation + login flow, 

property list (view-only baseline), and role-based Add/Edit/Delete/Settings access 

control as the most essential and non-negotiable features — the permission 

boundaries must work correctly since this is the core value of the whole system.

make it as PWA , and add to the css to globally hide any badge with lovable id, choose the name from you own, but make everything in arabic, and create a stunning logo, we will need it alot
Bro, these are the, the filters that you should add to the search page and to the add page. And, uh, this is ha- what happens when we press the, the share button

الفلاتر في صفحة البحث

الفلاتر الأساسية موجودة في SearchPanel.tsx، وهي:

- بحث برقم العرض

- نطاق أرقام العروض: من / إلى

- بحث خاص بالإدارة: باسم المكتب أو المالك

- نوع الإعلان

- حالة العقار

- نوع العقار متعدد الاختيارات

- المحافظة

- المنطقة مع إضافة وإزالة

- نطاق السعر

- نطاق عدد الغرف

- نطاق الطابق

- مستوى التشطيب

- الواجهة

- الاتجاه

- خيارات المزايا مثل:

  - سطح فقط

  - سطح كراج فقط

  - حديقة فقط

  - دوبلكس فقط

  - سطح مشترك

  - استطراق خارجي

  - مصعد

  - مسبح

  - إنترنت

  - مصعد 24

  - معلق

- خيار العروض المباشرة فقط

- زر إخفاء / إظهار الفلاتر

- عدد النتائج + اختيار الكل / إلغاء الاختيار

وفي صفحة إضافة وتعديل العقار، الفلاتر/الحقول الموجودة في PropertyForm.tsx تشمل:

- نوع الإعلان

- نوع السند

- نوع العقار

- المحافظة

- المنطقة

- تفاصيل العنوان

- الطابق

- سطح / كراج / حديقة / دوبلكس / معلق / صالون / مصعد 24

- عدد الغرف

- المساحة

- الواجهة

- الاتجاه

- مستوى الإكساء

- المزايا

- نوع الملكية + ملاحظات الملكية

- عدد الشركاء

- السعر

- العملة

- فترة السعر

- الحالة

- اسم المالك والهاتف

- اسم المكتب والهاتف

- رابط الفيسبوك

- الملاحظات

- تاريخ انتهاء الإيجار

- رفع صور ومقاطع فيديو + حذف الملفات الحالية أو الجديدة

---

ماذا يحدث عند الضغط على زر المشاركة

هناك مسارين رئيسيين:

1) مشاركة عقار واحد

في PropertyCard.tsx:

- عند الضغط على زر “مشاركة” على بطاقة العقار

- يفتح محرك المشاركة في ShareWizard.tsx

- يبدأ بمرحلة المشاركة

- ثم ممكن ينتقل إلى مشاركة الصور أو الفيديو

- ثم ينتهي

النص الفعلي يتم إنشاؤه في sharing.ts عبر دالة formatPropertyForShare، وهي تنشئ رسالة عربية جاهزة للواتساب تحتوي على:

- رقم العرض

- نوع العقار

- الموقع

- الطابق وخصائص السطح

- عدد الغرف والمساحة

- الواجهة

- الإكساء

- المزايا

- السعر

- ملاحظات

- أرقام واتساب/الاتصال

- نص الرسالة النهائي

2) مشاركة مجموعة من نتائج البحث

في SearchPanel.tsx:

- زر “مشاركة مع روابط”

- زر “مشاركة بدون روابط”

عند الضغط:

- يتحقق أن هناك عقارًا واحدًا على الأقل مختار

- يفلتر النتائج المختارة

- يزيل التكرار

- يبني نص الرسالة:

  - formatSearchResultsForShare → مع الروابط

  - formatSearchResultsForShareWithoutURLs → بدون روابط

- يقوم بنسخ النص إلى الحافظة

- يعرض تنبيهًا: “تم نسخ الرسالة بنجاح! افتح واتساب والصق الرسالة”

بمعنى آخر:

- اختيار العقارات

- إنشاء رسالة واتساب عربية

- نسخها

- لصقها في واتساب

وهناك أيضًا منطق احتياطي في sharing.ts:

- إذا كان المتصفح يدعم navigator.share فسيحاول مشاركة النص مع الوسائط

- إذا لم ينجح أو لم تكن الوسائط مدعومة، يfallback إلى واتساب

- وإذا لم يكن navigator.share موجودًا، يفتح واتساب مباشرة

and change the logo to this one please, keep the name as is
كمّل
 and fix this issue Pbkdf2 failed: iteration counts above 100000 are

.not supported (requested 120000) , it happens when i want to create a new worksapce, 
and You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
liquid-glass-button.tsx
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-primary-foreground hover:bg-destructive/90",
        cool: "dark:inset-shadow-2xs dark:inset-shadow-white/10 bg-linear-to-t border border-b-2 border-zinc-950/40 from-primary to-primary/85 shadow-md shadow-primary/20 ring-1 ring-inset ring-white/25 transition-[filter] duration-200 hover:brightness-110 active:brightness-90 dark:border-x-0 text-primary-foreground dark:text-primary-foreground dark:border-t-0 dark:border-primary/50 dark:ring-white/5",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes,
    VariantProps {
  asChild?: boolean
}

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants, liquidbuttonVariants, LiquidButton }

const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-105 duration-300 transition text-primary",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 text-xs gap-1.5 px-4 has-[>svg]:px-4",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 has-[>svg]:px-6",
        xxl: "h-14 rounded-md px-10 has-[>svg]:px-8",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "xxl",
    },
  }
)

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <>
      
        


        



        


          {children}
        


        
      
    
  )
}


function GlassFilter() {
  return (
    
      
        
          {/* Generate turbulent noise for distortion */}
          

          {/* Blur the turbulence pattern slightly */}
          

          {/* Displace the source graphic with the noise */}
          

          {/* Apply overall blur on the final result */}
          

          {/* Output the result */}
          
        
      
    
  );
}

type ColorVariant =
  | "default"
  | "primary"
  | "success"
  | "error"
  | "gold"
  | "bronze";
 
interface MetalButtonProps
  extends React.ButtonHTMLAttributes {
  variant?: ColorVariant;
}
 
const colorVariants: Record<
  ColorVariant,
  {
    outer: string;
    inner: string;
    button: string;
    textColor: string;
    textShadow: string;
  }
> = {
  default: {
    outer: "bg-gradient-to-b from-[#000] to-[#A0A0A0]",
    inner: "bg-gradient-to-b from-[#FAFAFA] via-[#3E3E3E] to-[#E5E5E5]",
    button: "bg-gradient-to-b from-[#B9B9B9] to-[#969696]",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(80_80_80_/_100%)]",
  },
  primary: {
    outer: "bg-gradient-to-b from-[#000] to-[#A0A0A0]",
    inner: "bg-gradient-to-b from-primary via-secondary to-muted",
    button: "bg-gradient-to-b from-primary to-primary/40",
    textColor: "text-white",
    textShadow: "[text-shadow:_0_-1px_0_rgb(30_58_138_/_100%)]",
  },
  success: {
    outer: "bg-gradient-to-b from-[#005A43] to-[#7CCB9B]",
    inner: "bg-gradient-to-b from-[#E5F8F0] via-[#00352F] to-[#D1F0E6]",
    button: "bg-gradient-to-b from-[#9ADBC8] to-[#3E8F7C]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(6_78_59_/_100%)]",
  },
  error: {
    outer: "bg-gradient-to-b from-[#5A0000] to-[#FFAEB0]",
    inner: "bg-gradient-to-b from-[#FFDEDE] via-[#680002] to-[#FFE9E9]",
    button: "bg-gradient-to-b from-[#F08D8F] to-[#A45253]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(146_64_14_/_100%)]",
  },
  gold: {
    outer: "bg-gradient-to-b from-[#917100] to-[#EAD98F]",
    inner: "bg-gradient-to-b from-[#FFFDDD] via-[#856807] to-[#FFF1B3]",
    button: "bg-gradient-to-b from-[#FFEBA1] to-[#9B873F]",
    textColor: "text-[#FFFDE5]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(178_140_2_/_100%)]",
  },
  bronze: {
    outer: "bg-gradient-to-b from-[#864813] to-[#E9B486]",
    inner: "bg-gradient-to-b from-[#EDC5A1] via-[#5F2D01] to-[#FFDEC1]",
    button: "bg-gradient-to-b from-[#FFE3C9] to-[#A36F3D]",
    textColor: "text-[#FFF7F0]",
    textShadow: "[text-shadow:_0_-1px_0_rgb(124_45_18_/_100%)]",
  },
};
 
const metalButtonVariants = (
  variant: ColorVariant = "default",
  isPressed: boolean,
  isHovered: boolean,
  isTouchDevice: boolean,
) => {
  const colors = colorVariants[variant];
  const transitionStyle = "all 250ms cubic-bezier(0.1, 0.4, 0.2, 1)";
 
  return {
    wrapper: cn(
      "relative inline-flex transform-gpu rounded-md p-[1.25px] will-change-transform",
      colors.outer,
    ),
    wrapperStyle: {
      transform: isPressed
        ? "translateY(2.5px) scale(0.99)"
        : "translateY(0) scale(1)",
      boxShadow: isPressed
        ? "0 1px 2px rgba(0, 0, 0, 0.15)"
        : isHovered && !isTouchDevice
          ? "0 4px 12px rgba(0, 0, 0, 0.12)"
          : "0 3px 8px rgba(0, 0, 0, 0.08)",
      transition: transitionStyle,
      transformOrigin: "center center",
    },
    inner: cn(
      "absolute inset-[1px] transform-gpu rounded-lg will-change-transform",
      colors.inner,
    ),
    innerStyle: {
      transition: transitionStyle,
      transformOrigin: "center center",
      filter:
        isHovered && !isPressed && !isTouchDevice ? "brightness(1.05)" : "none",
    },
    button: cn(
      "relative z-10 m-[1px] rounded-md inline-flex h-11 transform-gpu cursor-pointer items-center justify-center overflow-hidden rounded-md px-6 py-2 text-sm leading-none font-semibold will-change-transform outline-none",
      colors.button,
      colors.textColor,
      colors.textShadow,
    ),
    buttonStyle: {
      transform: isPressed ? "scale(0.97)" : "scale(1)",
      transition: transitionStyle,
      transformOrigin: "center center",
      filter:
        isHovered && !isPressed && !isTouchDevice ? "brightness(1.02)" : "none",
    },
  };
};
 
const ShineEffect = ({ isPressed }: { isPressed: boolean }) => {
  return (
    


      


    


  );
};
 
export const MetalButton = React.forwardRef<
  HTMLButtonElement,
  MetalButtonProps
>(({ children, className, variant = "default", ...props }, ref) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
 
  React.useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);
 
  const buttonText = children || "Button";
  const variants = metalButtonVariants(
    variant,
    isPressed,
    isHovered,
    isTouchDevice,
  );
 
  const handleInternalMouseDown = () => {
    setIsPressed(true);
  };
  const handleInternalMouseUp = () => {
    setIsPressed(false);
  };
  const handleInternalMouseLeave = () => {
    setIsPressed(false);
    setIsHovered(false);
  };
  const handleInternalMouseEnter = () => {
    if (!isTouchDevice) {
      setIsHovered(true);
    }
  };
  const handleInternalTouchStart = () => {
    setIsPressed(true);
  };
  const handleInternalTouchEnd = () => {
    setIsPressed(false);
  };
  const handleInternalTouchCancel = () => {
    setIsPressed(false);
  };
 
  return (
    


      


      
        
        {buttonText}
        {isHovered && !isPressed && !isTouchDevice && (
          


        )}
      


    


  );
});
 
MetalButton.displayName = "MetalButton";

demo.tsx
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export default function DemoOne() {
  return (
    <> 
      

 
        
          Liquid Glass
         
      


    
  )
}

```

Install NPM dependencies:
```bash
@radix-ui/react-slot, class-variance-authority
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
use this in every component, i want the app to look like an apple app
and this You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
glass-card.tsx
import { cn } from "@/lib/utils"

function GlassCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    


  )
}

function GlassCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    @container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 has-data-[slot=glass-card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  )
}

function GlassCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    


  )
}

function GlassCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    


  )
}

function GlassCardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    


  )
}

function GlassCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    


  )
}

function GlassCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    


  )
}
export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardAction,
  GlassCardContent,
  GlassCardFooter,
}


demo.tsx
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassCardDescription, GlassCardAction, GlassCardFooter } from "@/components/ui/glass-card";
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {Input} from '@/components/ui/input'

export default function DemoOne() {
  return 


   
      
        Login to your account
        
          Enter your email below to login to your account
        
        
          
              Sign Up
          
        
      
      
        


          


            


              Email
              @example.com"
                required
              />
            
            


              


                Password
                
                  Forgot your password?
                
              


              
            


          
        
      
      
        
          Login
        
        
            Login with Google
        
      
    
  ;
}

```

Copy-paste these files for dependencies:
```tsx
shadcn/button
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

```
```tsx
shadcn/label
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }

```
```tsx
shadcn/input
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

```

Install NPM dependencies:
```bash
@radix-ui/react-slot, class-variance-authority, @radix-ui/react-label
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
and this should be the app logo, and take the colors from it
the name of the app is مفتاح
You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
gradient-menu.tsx
import React from 'react';
import { IoHomeOutline, IoVideocamOutline, IoCameraOutline, IoShareSocialOutline, IoHeartOutline } from 'react-icons/io5';

const menuItems = [
  { title: 'Home', icon: , gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
  { title: 'Video', icon: , gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
  { title: 'Photo', icon: , gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
  { title: 'Share', icon: , gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
  { title: 'Tym', icon: , gradientFrom: '#ffa9c6', gradientTo: '#f434e2' }
];

export default function GradientMenu() {
  return (
    


      


        {menuItems.map(({ title, icon, gradientFrom, gradientTo }, idx) => (
          


            {/* Gradient background on hover */}
            
            {/* Blur glow */}
            

            {/* Icon */}
            
              {icon}
            

            {/* Title */}
            
              {title}
            
          


        ))}
      


    


  );
}


demo.tsx
import GradientMenu from "@/components/ui/gradient-menu";

const DemoOne = () => {
  return (
    


      
    


  );
};

export { DemoOne };

```

Install NPM dependencies:
```bash
react-icons
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
this should be the nav bar
and make everything like liquid glass , like apple designs
and don't make the liquid glass buttons look like blured transparent buttons, add them exactly as i gave you, and don't make the app laggy, make it so smooth on phones, because it is a phone app

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://miftah-property.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/45e1ae82-5673-45e8-9cf9-b8168de77125).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
