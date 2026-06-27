# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets, generics
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import IntegrityError
from .models import BusinessType, CustomerType, DsaName, HealthInsurance, HealthInsuranceAge, HealthInsuranceDetails, HealthInsuranceDetails, IndustryType, InsuranceCompany, LoanType, LoanVideo, News, NumberOfPerson, Offers, PayoutType, Policy, PolicyImage, Profile, Seminar, TypeOfPolicy, User, Department, Designation, BranchState, BranchLocation, SubLocation, Pincode, BranchInnerState, BranchInnerLocation, Bank, TypeOfAccount, VehicleDocument, VehicleInsurance, VehicleInsuranceDetails, VendorBank, VendorBankDesignation, DsaCode, Banker, Category, Payout, WorkIcon,SDSAUser,PartnerType,PartnerUser,VehicleMake,VehicleModel,ManufactureYear,CompanyName
from .serializers import BusinessTypeSerializer, CustomerTypeSerializer, DsaNameSerializer, HealthInsuranceAgeSerializer, HealthInsuranceDetailsSerializer, HealthInsuranceSerializer, IndustryTypeSerializer, InsuranceCompanySerializer, LoanTypeSerializer, LoanVideoSerializer, NewsSerializer, NumberOfPersonSerializer, PayoutTypeSerializer, PolicyImageSerializer, PolicySerializer, ProfileSerializer, SeminarSerializer, TypeOfPolicySerializer, UserSerializer, EmployeeCreateSerializer, DepartmentSerializer, DesignationSerializer, BranchStateSerializer, BranchLocationSerializer, SubLocationSerializer, PincodeSerializer, BranchInnerStateSerializer, BranchInnerLocationSerializer, BankSerializer, TypeOfAccountSerializer, VehicleDocumentSerializer, VehicleInsuranceDetailsSerializer, VehicleInsuranceSerializer, VendorBankDesignationSerializer, VendorBankSerializer, DsaCodeSerializer, BankerSerializer, CategorySerializer, PayoutSerializer, WorkIconSerializer,OffersSerializer,SDSAUserSerializer,PartnerTypeSerializer,PartnerUserSerializer,VehicleMakeSerializer,VehicleModelSerializer,ManufactureYearSerializer,CompanyNameSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.db.models import Q
import json

# Utility: generate JWT tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role
    }

# Login View
class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(request, username=username, password=password)
        if user:
            tokens = get_tokens_for_user(user)
            return Response(tokens, status=status.HTTP_200_OK)

        return Response(
            {"error": "Invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )


# Check username availability
class CheckUsernameView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        exists = User.objects.filter(username=username).exists()
        return Response({'exists': exists})


# Admin-only CRUD for Users
class UserManagementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # GET → Handle both listing and single user retrieval
    def get(self, request, pk=None):
        if pk is not None:
            # Get single user by ID (GET /users/{id}/)
            try:
                user = User.objects.get(pk=pk)
                
                # Check permissions
                if request.user.role != 'admin' and request.user.id != user.id:
                    return Response(
                        {"error": "You can only view your own profile"},
                        status=status.HTTP_403_FORBIDDEN
                    )
                    
                serializer = UserSerializer(user)
                return Response(serializer.data)
                
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # List all users (GET /users/)
            if request.user.role in ['admin', 'employee']:
                users = User.objects.exclude(role='admin')
            else:
                users = User.objects.none()
                
            serializer = UserSerializer(users, many=True)
            return Response(serializer.data)

    # POST → Create Employee (Admin only)
    def post(self, request):
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admin can create employees'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = EmployeeCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response(
                    {
                        'message': 'Employee created successfully',
                        'data': UserSerializer(user).data
                    },
                    status=status.HTTP_201_CREATED
                )
            except IntegrityError:
                return Response(
                    {'error': 'Username already exists'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PUT → Update Employee (Full update)
    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permissions
        if request.user.role != 'admin' and request.user.id != user.id:
            return Response(
                {"error": "You can only update your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = UserSerializer(user, data=request.data, partial=False)  # Full update
        if serializer.is_valid():
            password = request.data.get('password')
            if password:
                user.set_password(password)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PATCH → Partial Update Employee (For work_icons and payout_icons)
    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check permissions
        if request.user.role != 'admin' and request.user.id != user.id:
            return Response(
                {"error": "You can only update your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = UserSerializer(user, data=request.data, partial=True)  # Partial update
        if serializer.is_valid():
            password = request.data.get('password')
            if password:
                user.set_password(password)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE → Delete Employee (Admin only)
    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response(
                {"error": "Only admin can delete users"},
                status=status.HTTP_403_FORBIDDEN
            )
                
        try:
            user = User.objects.get(pk=pk, role='employee')
            user.delete()
            return Response({"message": "Employee deleted"})
        except User.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)


# View to get departments (for dropdown)
class DepartmentDropdownView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        departments = Department.objects.filter(status=True)
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)


# View to get designations by department
class DesignationByDepartmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, department_id):
        try:
            designations = Designation.objects.filter(
                department_id=department_id,
                status=True
            )
            serializer = DesignationSerializer(designations, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


# Filtered Payout View for Users
class FilteredPayoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get current user
        user = request.user
        
        # Get user's payout permissions
        payout_icons = getattr(user, 'payout_icons', [])
        
        # Parse payout_icons if it's a string
        if isinstance(payout_icons, str):
            try:
                payout_icons = json.loads(payout_icons) if payout_icons else []
            except:
                payout_icons = []
        
        # If admin or user has no specific permissions, show all
        if user.role == 'admin' or not payout_icons:
            payouts = Payout.objects.all()
        else:
            # Filter by user's payout permissions
            payouts = Payout.objects.filter(payout_name__in=payout_icons)
        
        # Apply filters from query params
        vendor_bank = request.query_params.get('vendor_bank')
        if vendor_bank:
            payouts = payouts.filter(vendor_bank=vendor_bank)
        
        loan_type = request.query_params.get('loan_type')
        if loan_type:
            payouts = payouts.filter(loan_type=loan_type)
        
        payout_name = request.query_params.get('payout_name')
        if payout_name:
            payouts = payouts.filter(payout_name=payout_name)
        
        # Get related data for better display
        payouts_list = []
        for payout in payouts:
            payout_data = {
                'id': payout.id,
                'payout': payout.payout,
                'created_at': payout.created_at,
                'vendor_bank': payout.vendor_bank_id,
                'vendor_bank_name': payout.vendor_bank.vendor_name if payout.vendor_bank else None,
                'loan_type': payout.loan_type_id,
                'loan_type_name': payout.loan_type.loan_type if payout.loan_type else None,
                'category_name': payout.category_name_id,
                'category_name_value': payout.category_name.category_name if payout.category_name else None,
                'payout_name': payout.payout_name_id,
                'payout_name_value': payout.payout_name.payout_name if payout.payout_name else None,
            }
            payouts_list.append(payout_data)
        
        # Get related data for dropdowns
        vendor_banks = VendorBank.objects.filter(status=True)
        loan_types = LoanType.objects.filter(status=True)
        payout_types = PayoutType.objects.filter(status=True)
        
        response_data = {
            'payouts': payouts_list,
            'filters': {
                'vendor_banks': VendorBankSerializer(vendor_banks, many=True).data,
                'loan_types': LoanTypeSerializer(loan_types, many=True).data,
                'payout_types': PayoutTypeSerializer(payout_types, many=True).data,
            },
            'user_permissions': {
                'has_permissions': len(payout_icons) > 0,
                'payout_icons': payout_icons
            }
        }
        
        return Response(response_data)







class UserPayoutIconsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Parse payout_icons from JSON string to list
        payout_icon_ids = []
        if user.payout_icons:
            try:
                payout_icon_ids = json.loads(user.payout_icons)
            except:
                payout_icon_ids = []
        
        # Get WorkIcon objects for these IDs
        work_icons = WorkIcon.objects.filter(id__in=payout_icon_ids, status=True)
        
        # Serialize the work icons
        work_icon_data = []
        for icon in work_icons:
            work_icon_data.append({
                'id': icon.id,
                'name': icon.icon_name,
                'description': icon.icon_description,
                'image_url': icon.icon_image.url if icon.icon_image else None,
                'icon_url': icon.icon_url,
                'username': icon.username,
                'password': icon.password
            })
        
        # Also parse work_icons for the user
        work_icon_ids = []
        if user.work_icons:
            try:
                work_icon_ids = json.loads(user.work_icons)
            except:
                work_icon_ids = []
        
        user_work_icons = WorkIcon.objects.filter(id__in=work_icon_ids, status=True)
        user_work_icon_data = []
        for icon in user_work_icons:
            user_work_icon_data.append({
                'id': icon.id,
                'name': icon.icon_name,
                'description': icon.icon_description,
                'image_url': icon.icon_image.url if icon.icon_image else None,
                'icon_url': icon.icon_url
            })
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'role': user.role,
                'employee_id': user.employee_id
            },
            'payout_icons': work_icon_data,
            'work_icons': user_work_icon_data,
            'payout_icon_ids': payout_icon_ids,
            'work_icon_ids': work_icon_ids
        })










# ViewSets
class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class DesignationViewSet(ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]


class BranchStateViewSet(ModelViewSet):
    queryset = BranchState.objects.all()
    serializer_class = BranchStateSerializer
    permission_classes = [permissions.IsAuthenticated]


class BranchLocationViewSet(ModelViewSet):
    queryset = BranchLocation.objects.all()
    serializer_class = BranchLocationSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubLocationViewSet(viewsets.ModelViewSet):
    queryset = SubLocation.objects.all()
    serializer_class = SubLocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = SubLocation.objects.all()
        
        branch_state = self.request.query_params.get('branch_state')
        if branch_state:
            queryset = queryset.filter(branch_state=branch_state)
        
        branch_location = self.request.query_params.get('branch_location')
        if branch_location:
            queryset = queryset.filter(branch_location=branch_location)
        
        status = self.request.query_params.get('status')
        if status is not None:
            queryset = queryset.filter(status=status)
        
        return queryset


class SubLocationByLocationView(generics.ListAPIView):
    serializer_class = SubLocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        location_id = self.kwargs['location_id']
        return SubLocation.objects.filter(branch_location=location_id, status=True)


class BranchInnerStateViewSet(ModelViewSet):
    queryset = BranchInnerState.objects.all()
    serializer_class = BranchInnerStateSerializer
    permission_classes = [permissions.IsAuthenticated]


class BranchInnerLocationViewSet(ModelViewSet):
    queryset = BranchInnerLocation.objects.all()
    serializer_class = BranchInnerLocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = BranchInnerLocation.objects.all()
        branch_inner_state = self.request.query_params.get('branch_inner_state')
        branch_location = self.request.query_params.get('branch_location')
        status = self.request.query_params.get('status')

        if branch_inner_state:
            queryset = queryset.filter(branch_inner_state=branch_inner_state)
        if branch_location:
            queryset = queryset.filter(branch_location=branch_location)
        if status is not None:
            queryset = queryset.filter(status=status)

        return queryset


class PincodeViewSet(viewsets.ModelViewSet):
    queryset = Pincode.objects.all()
    serializer_class = PincodeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Pincode.objects.all()
        branch_state = self.request.query_params.get('branch_state')
        branch_location = self.request.query_params.get('branch_location')
        sub_location = self.request.query_params.get('sub_location')
        status = self.request.query_params.get('status')

        if branch_state:
            queryset = queryset.filter(branch_state=branch_state)
        if branch_location:
            queryset = queryset.filter(branch_location=branch_location)
        if sub_location:
            queryset = queryset.filter(sub_location=sub_location)
        if status is not None:
            queryset = queryset.filter(status=status)

        return queryset


class BankViewSet(ModelViewSet):
    queryset = Bank.objects.filter(status=True)
    serializer_class = BankSerializer
    permission_classes = [permissions.IsAuthenticated]


class TypeOfAccountViewSet(ModelViewSet):
    queryset = TypeOfAccount.objects.filter(status=True)
    serializer_class = TypeOfAccountSerializer
    permission_classes = [permissions.IsAuthenticated]


class VendorBankViewSet(ModelViewSet):
    queryset = VendorBank.objects.filter(status=True)
    serializer_class = VendorBankSerializer
    permission_classes = [permissions.IsAuthenticated]


class VendorBankDesignationViewSet(ModelViewSet):
    queryset = VendorBankDesignation.objects.filter(status=True)
    serializer_class = VendorBankDesignationSerializer
    permission_classes = [permissions.IsAuthenticated]


class DsaNameViewSet(ModelViewSet):
    queryset = DsaName.objects.all()
    serializer_class = DsaNameSerializer
    permission_classes = [permissions.IsAuthenticated]


class LoanTypeViewSet(ModelViewSet):
    queryset = LoanType.objects.all()
    serializer_class = LoanTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class DsaCodeViewSet(ModelViewSet):
    queryset = DsaCode.objects.all().order_by('-created_at')
    serializer_class = DsaCodeSerializer
    permission_classes = [permissions.IsAuthenticated]


class BankerViewSet(ModelViewSet):
    queryset = Banker.objects.all().order_by('-created_at')
    serializer_class = BankerSerializer
    permission_classes = [permissions.IsAuthenticated]


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class PayoutTypeViewSet(ModelViewSet):
    queryset = PayoutType.objects.all()
    serializer_class = PayoutTypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class PayoutViewSet(ModelViewSet):
    queryset = Payout.objects.all()
    serializer_class = PayoutSerializer
    permission_classes = [permissions.IsAuthenticated]


class WorkIconViewSet(ModelViewSet):
    queryset = WorkIcon.objects.all()
    serializer_class = WorkIconSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active work icons"""
        queryset = WorkIcon.objects.filter(status=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    


#offers viewset

class OffersViewSet(ModelViewSet):
    queryset = Offers.objects.all()
    serializer_class = OffersSerializer
    permission_classes = [permissions.IsAuthenticated]




class NewsViewSet(ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [permissions.IsAuthenticated]




class PolicyImageViewSet(ModelViewSet):
    queryset = PolicyImage.objects.all()
    serializer_class = PolicyImageSerializer
    permission_classes = [permissions.IsAuthenticated]




class LoanVideoViewSet(ModelViewSet):
    queryset = LoanVideo.objects.all().order_by('-created_at')
    serializer_class = LoanVideoSerializer
    permission_classes = [permissions.IsAuthenticated]




class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all().order_by('-created_at')
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]



class SeminarViewSet(ModelViewSet):
    queryset = Seminar.objects.all().order_by('-created_at')
    serializer_class = SeminarSerializer
    permission_classes = [permissions.IsAuthenticated]



class PolicyViewSet(ModelViewSet):
    queryset = Policy.objects.all().order_by('-created_at')
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]











#-------------------------SDSA VIEWS------------------------
class CheckSDSAEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        email = request.data.get('email_id') or request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exists = SDSAUser.objects.filter(email_id=email).exists()
        return Response({'exists': exists})


class SDSAUserViewSet(viewsets.ModelViewSet):
    queryset = SDSAUser.objects.all().order_by('-created_at')
    serializer_class = SDSAUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_param = self.request.query_params.get('status')
        if status_param is not None:
            if status_param.lower() == 'active':
                queryset = queryset.filter(status=True)
            elif status_param.lower() == 'inactive':
                queryset = queryset.filter(status=False)
        
        # Filter by search term
        search_term = self.request.query_params.get('search')
        if search_term:
            queryset = queryset.filter(
                Q(email_id__icontains=search_term) |
                Q(first_name__icontains=search_term) |
                Q(last_name__icontains=search_term) |
                Q(phone_number__icontains=search_term) |
                Q(company_name__icontains=search_term)
            )
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        try:
            # Check if email already exists
            email_id = request.data.get('email_id')
            if email_id and SDSAUser.objects.filter(email_id=email_id).exists():
                return Response(
                    {'error': 'Email already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().create(request, *args, **kwargs)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def perform_create(self, serializer):
        serializer.save(createdBy=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active SDSA users"""
        queryset = self.get_queryset().filter(status=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def inactive(self, request):
        """Get inactive SDSA users"""
        queryset = self.get_queryset().filter(status=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SDSAUserLoginView(APIView):
    """
    SDSA User Login with email and password
    """
    def post(self, request):
        email = request.data.get("email_id")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Find SDSA user by email
            sdsa_user = SDSAUser.objects.get(email_id=email)
            
            # Check password
            if sdsa_user.check_password(password):
                if not sdsa_user.status:
                    return Response(
                        {"error": "Account is inactive. Please contact administrator."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Generate JWT token
                refresh = RefreshToken.for_user(sdsa_user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user_id': sdsa_user.id,
                    'email': sdsa_user.email_id,
                    'first_name': sdsa_user.first_name,
                    'last_name': sdsa_user.last_name,
                    'company_name': sdsa_user.company_name,
                    'role': 'sdsa_user'
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except SDSAUser.DoesNotExist:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )








#-------------------------Partners VIEWS------------------------


class PartnerTypeViewSet(ModelViewSet):
    queryset = PartnerType.objects.all()
    serializer_class = PartnerTypeSerializer
    permission_classes = [permissions.IsAuthenticated]






class CheckPartnerEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        email = request.data.get('email_id') or request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        exists = PartnerUser.objects.filter(email_id=email).exists()
        return Response({'exists': exists})


class PartnerUserViewSet(viewsets.ModelViewSet):
    queryset = PartnerUser.objects.all().order_by('-created_at')
    serializer_class = PartnerUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by partner_type if provided
        partner_type = self.request.query_params.get('partner_type')
        if partner_type:
            queryset = queryset.filter(partner_type=partner_type)
        
        # Filter by status if provided
        status_param = self.request.query_params.get('status')
        if status_param is not None:
            if status_param.lower() == 'active':
                queryset = queryset.filter(status=True)
            elif status_param.lower() == 'inactive':
                queryset = queryset.filter(status=False)
        
        # Filter by search term
        search_term = self.request.query_params.get('search')
        if search_term:
            queryset = queryset.filter(
                Q(email_id__icontains=search_term) |
                Q(first_name__icontains=search_term) |
                Q(last_name__icontains=search_term) |
                Q(phone_number__icontains=search_term) |
                Q(company_name__icontains=search_term) |
                Q(alias_name__icontains=search_term)
            )
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        try:
            # Check if email already exists
            email_id = request.data.get('email_id')
            if email_id and PartnerUser.objects.filter(email_id=email_id).exists():
                return Response(
                    {'error': 'Email already exists'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return super().create(request, *args, **kwargs)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def perform_create(self, serializer):
        serializer.save(createdBy=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active partner users"""
        queryset = self.get_queryset().filter(status=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def inactive(self, request):
        """Get inactive partner users"""
        queryset = self.get_queryset().filter(status=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PartnerUserLoginView(APIView):
    """
    Partner User Login with email and password
    """
    def post(self, request):
        email = request.data.get("email_id")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Find partner user by email
            partner_user = PartnerUser.objects.get(email_id=email)
            
            # Check password
            if partner_user.check_password(password):
                if not partner_user.status:
                    return Response(
                        {"error": "Account is inactive. Please contact administrator."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Generate JWT token
                refresh = RefreshToken.for_user(partner_user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user_id': partner_user.id,
                    'email': partner_user.email_id,
                    'first_name': partner_user.first_name,
                    'last_name': partner_user.last_name,
                    'company_name': partner_user.company_name,
                    'partner_type': partner_user.partner_type.partner_type if partner_user.partner_type else None,
                    'role': 'partner_user'
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Invalid email or password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        except PartnerUser.DoesNotExist:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        



class VehicleMakeViewSet(ModelViewSet):
    queryset = VehicleMake.objects.all()
    serializer_class = VehicleMakeSerializer
    permission_classes = [permissions.IsAuthenticated]






class VehicleModelViewSet(ModelViewSet):
    queryset = VehicleModel.objects.all()
    serializer_class = VehicleModelSerializer
    permission_classes = [permissions.IsAuthenticated]




class ManufactureYearViewSet(ModelViewSet):
    queryset = ManufactureYear.objects.all()
    serializer_class = ManufactureYearSerializer
    permission_classes = [permissions.IsAuthenticated]



class CompanyNameViewSet(ModelViewSet):
    queryset = CompanyName.objects.all()
    serializer_class = CompanyNameSerializer
    permission_classes = [permissions.IsAuthenticated]




class CustomerTypeViewSet(ModelViewSet):
    queryset = CustomerType.objects.all()
    serializer_class = CustomerTypeSerializer
    permission_classes = [permissions.IsAuthenticated]



class IndustryTypeViewSet(ModelViewSet):
    queryset = IndustryType.objects.all()
    serializer_class = IndustryTypeSerializer
    permission_classes = [permissions.IsAuthenticated]




class BusinessTypeViewSet(ModelViewSet):
    queryset = BusinessType.objects.all()
    serializer_class = BusinessTypeSerializer
    permission_classes = [permissions.IsAuthenticated]





#-----------------VEHICLE add INSURANCE VIEWS -----------------


class VehicleInsuranceViewSet(ModelViewSet):
    queryset = VehicleInsurance.objects.all()
    serializer_class = VehicleInsuranceSerializer
    permission_classes = [permissions.IsAuthenticated]



class VehicleDocumentViewSet(ModelViewSet):
    queryset = VehicleDocument.objects.all()
    serializer_class = VehicleDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]




class VehicleInsuranceDetailsViewSet(ModelViewSet):
    queryset = VehicleInsuranceDetails.objects.all()
    serializer_class = VehicleInsuranceDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]









#-----------------HEALTH INSURANCE VIEWS -----------------

class InsuranceCompanyViewSet(ModelViewSet):
    queryset = InsuranceCompany.objects.all()
    serializer_class = InsuranceCompanySerializer
    permission_classes = [permissions.IsAuthenticated]




class TypeOfPolicyViewSet(ModelViewSet):
    queryset = TypeOfPolicy.objects.all()
    serializer_class = TypeOfPolicySerializer
    permission_classes = [permissions.IsAuthenticated]



class HealthInsuranceAgeViewSet(ModelViewSet):
    queryset = HealthInsuranceAge.objects.all()
    serializer_class = HealthInsuranceAgeSerializer
    permission_classes = [permissions.IsAuthenticated]




class NumberOfPersonViewSet(ModelViewSet):
    queryset = NumberOfPerson.objects.all()
    serializer_class = NumberOfPersonSerializer
    permission_classes = [permissions.IsAuthenticated]



class HealthInsuranceViewSet(ModelViewSet):
    queryset = HealthInsurance.objects.all()
    serializer_class = HealthInsuranceSerializer
    permission_classes = [permissions.IsAuthenticated]




class HealthInsuranceDetailsViewSet(ModelViewSet):
    queryset = HealthInsuranceDetails.objects.all()
    serializer_class = HealthInsuranceDetailsSerializer
    permission_classes = [permissions.IsAuthenticated]
    