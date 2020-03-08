# CSE135FinalProject

Repo for the final project of cse 135<br/>
Sepehr Foroughi Shafiei A14766011<br/>
Shaya Parsa A13342802 <br/>
Simon Kaufmann A16140686 <br/>

Brief overview of your authentication code and how you implemented it (including any code or libraries you needed)

    We used the Firebase authentication system for all the users and
    admins. we manually create the first admin and the first admin has
    control to create new user accounts or other admin accounts.
    first admin plays the role of superuser.also admin can delete the
    user account.
    our authentication systems have logging through username (email) and
    passwords. both admin and user have the ability to reset their
    passwords.
    if any user is not defined in our systems we redirect them to
    login.html
    Here is an overview of our code inside auth.js and it shows how we
    make authentications inside login page:

![auth_snippet_code](/public/media/auth_snippet_code.png)
  
Diagram that shows how your PoC examples work together including their routes

    For our routing diagram since we used traditional html formating not SPA we showed
    all of our routing inside our wireframe in last part please refer to the diagram
    in last part.

Discussion of the grid library you used
  
 For our grids, we will use Zinga Grid. Zing Grid plain JavaScript
web component that natively works with all frameworks, styles easily
and has many built-in grid features
  
Discussion of the chart library you used

    For our chars, we will use Zing Chart. Zing Chart create animated &
    interactive charts with hundreds of thousands of data records using
    the ZingChart JavaScript charting library

Code of the PoC will be per area
  
 /public/scripts/auth.js: in this file we are implementing authentications
  
 /public/scripts/dashboard.js: in this file we are implementing data extraction
from our database and prepare our data for chart and grid functions

    /public/nav.js: this script is responsible for determining if the user is admin or not.

    /public/setting.js: this script handles some logic for the settings page.

    /public/users.js: this script handles CRUD operations on users. Only for admin users.


App diagram and wireframes to implement for final project

    Here is PDF format for app-diagram:

[app-dragram](/public/media/app-diagram.pdf)
  
 Here is PDF format for wireframe:
  
[Wireframe](/public/media/wireframe.pdf)

    Here is a link to better quality:

[Wireframe link](https://miro.com/welcomeonboard/r5cdFwjFBnVmmrWhmBXtH4ugCyHbD6nFNAlS5mwm1SmmzldW02ljha5rdDPDaFu0)
