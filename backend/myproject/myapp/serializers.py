# serializers.py
from rest_framework import serializers
from .models import BusinessType, CompanyName, CustomerType, DsaName, HealthInsurance, HealthInsuranceAge, HealthInsuranceDetails, IndustryType, InsuranceCompany, LoanType, LoanVideo, News, NumberOfPerson, Offers, PayoutType, Policy, PolicyImage, Profile, Seminar, TypeOfPolicy, User, Department, Designation, BranchState, BranchLocation, SubLocation, Pincode, BranchInnerState, BranchInnerLocation, Bank, TypeOfAccount, VehicleDocument, VehicleInsurance, VehicleInsuranceDetails, VendorBank, VendorBankDesignation, DsaCode, Banker, Category, Payout, WorkIcon,SDSAUser,PartnerType,PartnerUser,VehicleMake,VehicleModel,ManufactureYear
import re
import json


class UserSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_name = serializers.CharField(source='designation.name', read_only=True)
    
    # Make work_icons and payout_icons regular fields that handle conversion
    work_icons = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    payout_icons = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'email', 'employee_id',
            'contact_info', 'role', 'password', 'department', 'designation',
            'department_name', 'designation_name', 'created_at', 
            'first_name', 'last_name', 'office_phone_number', 'office_email', 
            'aadhar_number', 'pan_number', 'account_number', 'ifsc_code', 
            'pan_card_upload', 'aadhar_card_upload', 'bank_proof_upload', 
            'employee_image', 'present_address', 'permanent_address', 
            'date_of_birth', 'branch_state', 'branch_location','branch_inner_state','branch_inner_location', 'bank', 
            'type_of_account', 'work_icons', 'payout_icons',  'ref_name_1',
            'ref_relation_1', 'ref_mobile_1', 'ref_address_1','ref_name_2', 
            'ref_relation_2', 'ref_mobile_2', 'ref_address_2','is_active','reportingTo',
            
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'department': {'required': False},
            'designation': {'required': False},
            'work_icons': {'required': False, 'allow_null': True},
            'payout_icons': {'required': False, 'allow_null': True}
        }
    
    def to_representation(self, instance):
        """Convert work_icons and payout_icons strings to arrays for GET requests"""
        representation = super().to_representation(instance)
        
        # Parse work_icons string to array
        work_icons_str = representation.get('work_icons')
        if work_icons_str:
            try:
                # Try to parse as JSON
                parsed = json.loads(work_icons_str)
                if isinstance(parsed, list):
                    representation['work_icons'] = parsed
                else:
                    # If it's not a list, create one
                    representation['work_icons'] = [str(parsed)]
            except (json.JSONDecodeError, TypeError):
                # If not JSON, try comma-separated
                if ',' in work_icons_str:
                    representation['work_icons'] = [
                        item.strip() for item in work_icons_str.split(',') 
                        if item.strip()
                    ]
                elif work_icons_str.strip():
                    representation['work_icons'] = [work_icons_str.strip()]
                else:
                    representation['work_icons'] = []
        else:
            representation['work_icons'] = []
        
        # Parse payout_icons string to array
        payout_icons_str = representation.get('payout_icons')
        if payout_icons_str:
            try:
                # Try to parse as JSON
                parsed = json.loads(payout_icons_str)
                if isinstance(parsed, list):
                    representation['payout_icons'] = parsed
                else:
                    # If it's not a list, create one
                    representation['payout_icons'] = [str(parsed)]
            except (json.JSONDecodeError, TypeError):
                # If not JSON, try comma-separated
                if ',' in payout_icons_str:
                    representation['payout_icons'] = [
                        item.strip() for item in payout_icons_str.split(',') 
                        if item.strip()
                    ]
                elif payout_icons_str.strip():
                    representation['payout_icons'] = [payout_icons_str.strip()]
                else:
                    representation['payout_icons'] = []
        else:
            representation['payout_icons'] = []
        
        return representation
    
    def to_internal_value(self, data):
        """Convert work_icons and payout_icons arrays to strings for POST/PUT/PATCH requests"""
        # Create a mutable copy of data
        data = data.copy()
        
        # Handle work_icons
        if 'work_icons' in data:
            work_icons_value = data['work_icons']
            
            if work_icons_value is None or work_icons_value == '':
                data['work_icons'] = '[]'
            elif isinstance(work_icons_value, list):
                # Convert list to JSON string
                if len(work_icons_value) == 0:
                    data['work_icons'] = '[]'
                else:
                    data['work_icons'] = json.dumps(work_icons_value)
            elif isinstance(work_icons_value, str):
                # If it's already a string, try to validate it
                if work_icons_value.strip().startswith('[') and work_icons_value.strip().endswith(']'):
                    # Already JSON, keep as is
                    try:
                        json.loads(work_icons_value)
                        data['work_icons'] = work_icons_value
                    except json.JSONDecodeError:
                        data['work_icons'] = '[]'
                else:
                    # Not JSON, convert to JSON array
                    if ',' in work_icons_value:
                        items = [item.strip() for item in work_icons_value.split(',') if item.strip()]
                        if len(items) == 0:
                            data['work_icons'] = '[]'
                        else:
                            data['work_icons'] = json.dumps(items)
                    elif work_icons_value.strip():
                        data['work_icons'] = json.dumps([work_icons_value.strip()])
                    else:
                        data['work_icons'] = '[]'
        
        # Handle payout_icons (same logic as work_icons)
        if 'payout_icons' in data:
            payout_icons_value = data['payout_icons']
            
            if payout_icons_value is None or payout_icons_value == '':
                data['payout_icons'] = '[]'
            elif isinstance(payout_icons_value, list):
                # Convert list to JSON string
                if len(payout_icons_value) == 0:
                    data['payout_icons'] = '[]'
                else:
                    data['payout_icons'] = json.dumps(payout_icons_value)
            elif isinstance(payout_icons_value, str):
                # If it's already a string, try to validate it
                if payout_icons_value.strip().startswith('[') and payout_icons_value.strip().endswith(']'):
                    # Already JSON, keep as is
                    try:
                        json.loads(payout_icons_value)
                        data['payout_icons'] = payout_icons_value
                    except json.JSONDecodeError:
                        data['payout_icons'] = '[]'
                else:
                    # Not JSON, convert to JSON array
                    if ',' in payout_icons_value:
                        items = [item.strip() for item in payout_icons_value.split(',') if item.strip()]
                        if len(items) == 0:
                            data['payout_icons'] = '[]'
                        else:
                            data['payout_icons'] = json.dumps(items)
                    elif payout_icons_value.strip():
                        data['payout_icons'] = json.dumps([payout_icons_value.strip()])
                    else:
                        data['payout_icons'] = '[]'
        
        return super().to_internal_value(data)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        return super().update(instance, validated_data)








    def get_employee_image_url(self, obj):
        if obj.employee_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.employee_image.url)
            else:
                # Fallback: construct URL manually if no request context
                # Adjust the domain/port as needed
                return f"http://localhost:8000{obj.employee_image.url}"
        return None
    
    def get_pan_card_upload_url(self, obj):
        if obj.pan_card_upload:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pan_card_upload.url)
            else:
                return f"http://localhost:8000{obj.pan_card_upload.url}"
        return None
    
    def get_aadhar_card_upload_url(self, obj):
        if obj.aadhar_card_upload:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.aadhar_card_upload.url)
            else:
                return f"http://localhost:8000{obj.aadhar_card_upload.url}"
        return None
    
    def get_bank_proof_upload_url(self, obj):
        if obj.bank_proof_upload:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.bank_proof_upload.url)
            else:
                return f"http://localhost:8000{obj.bank_proof_upload.url}"
        return None





        


class EmployeeCreateSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(status=True),
        required=True
    )
    designation = serializers.PrimaryKeyRelatedField(
        queryset=Designation.objects.filter(status=True),
        required=True
    )
    branch_state = serializers.PrimaryKeyRelatedField(
        queryset=BranchState.objects.filter(status=True),
        required=False,
        allow_null=True
    )
    branch_location = serializers.PrimaryKeyRelatedField(
        queryset=BranchLocation.objects.filter(status=True),
        required=False,
        allow_null=True
    )

    branch_inner_state = serializers.PrimaryKeyRelatedField(
    queryset=BranchInnerState.objects.filter(status=True),
    required=False,
    allow_null=True
    )

    branch_inner_location = serializers.PrimaryKeyRelatedField(
    queryset=BranchInnerLocation.objects.filter(status=True),
    required=False,
    allow_null=True
    )

    bank = serializers.PrimaryKeyRelatedField(
        queryset=Bank.objects.filter(status=True),
        required=False,
        allow_null=True
    )
    type_of_account = serializers.PrimaryKeyRelatedField(
        queryset=TypeOfAccount.objects.filter(status=True),
        required=False,
        allow_null=True
    )
    
    # Work icons and Payout icons fields
    work_icons = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    payout_icons = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            # Login credentials
            'username',
            'password',
            
            # Basic info
            'first_name',
            'last_name',
            'full_name',
            'date_of_birth',
            
            # Contact info
            'email',
            'office_email',
            'contact_info',
            'office_phone_number',
            
            # Department & Designation
            'department',
            'designation',
            
            # Address
            'present_address',
            'permanent_address',
            
            # States info
            'branch_state',
            'branch_location',
            # branch info
            'branch_inner_state',
            'branch_inner_location',
            
            # Govt details
            'aadhar_number',
            'pan_number',
            
            # Bank details
            'account_number',
            'ifsc_code',
            'bank',
            'type_of_account',
            
            # File uploads
            'pan_card_upload',
            'aadhar_card_upload',
            'bank_proof_upload',
            'employee_image',
            
            # Icons
            'work_icons',
            'payout_icons'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'username': {'required': True},
            'department': {'required': True},
            'designation': {'required': True},
            'contact_info': {'required': True},
        }
    
    def validate(self, data):
        # Convert contact_info to integer if it's a string
        if 'contact_info' in data and data['contact_info']:
            try:
                data['contact_info'] = int(data['contact_info'])
            except (ValueError, TypeError):
                raise serializers.ValidationError({
                    "contact_info": "Contact info must be a valid number"
                })
        
        # Validate Aadhar number (12 digits)
        if data.get('aadhar_number') and not data['aadhar_number'].isdigit():
            raise serializers.ValidationError({"aadhar_number": "Aadhar number must contain only digits"})
        
        if data.get('aadhar_number') and len(data['aadhar_number']) != 12:
            raise serializers.ValidationError({"aadhar_number": "Aadhar number must be 12 digits"})
        
        # Validate PAN number format
        if data.get('pan_number'):
            pan = data['pan_number'].upper()
            if not pan.isalnum() or len(pan) != 10:
                raise serializers.ValidationError({"pan_number": "PAN number must be 10 alphanumeric characters"})
            data['pan_number'] = pan
        
        # Validate IFSC code
        if data.get('ifsc_code'):
            ifsc = data['ifsc_code'].upper()
            if not ifsc.isalnum() or len(ifsc) != 11:
                raise serializers.ValidationError({"ifsc_code": "IFSC code must be 11 alphanumeric characters"})
            data['ifsc_code'] = ifsc
        
        # Validate phone numbers
        phone_regex = r'^\d{10}$'
        if data.get('contact_info') and not re.match(phone_regex, str(data['contact_info'])):
            raise serializers.ValidationError({"contact_info": "Phone number must be 10 digits"})
        
        if data.get('office_phone_number') and not re.match(phone_regex, data['office_phone_number']):
            raise serializers.ValidationError({"office_phone_number": "Office phone number must be 10 digits"})
        
        return data
    
    def create(self, validated_data):
        # Set employee role by default
        validated_data['role'] = 'employee'
        
        # Handle password separately
        password = validated_data.pop('password', None)
        
        # Create user
        user = User(**validated_data)
        
        # Set password if provided
        if password:
            user.set_password(password)
        
        user.save()
        return user
    
    def to_internal_value(self, data):
        """Handle work_icons and payout_icons conversion for employee creation"""
        # Handle work_icons
        if 'work_icons' in data and isinstance(data['work_icons'], list):
            data = data.copy()
            if len(data['work_icons']) == 0:
                data['work_icons'] = '[]'
            else:
                data['work_icons'] = json.dumps(data['work_icons'])
        
        # Handle payout_icons
        if 'payout_icons' in data and isinstance(data['payout_icons'], list):
            data = data.copy()
            if len(data['payout_icons']) == 0:
                data['payout_icons'] = '[]'
            else:
                data['payout_icons'] = json.dumps(data['payout_icons'])
        
        return super().to_internal_value(data)


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class DesignationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    
    class Meta:
        model = Designation
        fields = ['id', 'name', 'department', 'department_name', 'status']
    
    def validate_department(self, value):
        if not value:
            raise serializers.ValidationError("Department is required")
        return value
    
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Designation name is required")
        return value.strip()


    def create(self, validated_data):
        return Designation.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.department = validated_data.get('department', instance.department)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance


class BranchStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchState
        fields = '__all__'


class BranchLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchLocation
        fields = '__all__'


class SubLocationSerializer(serializers.ModelSerializer):
    branch_state_name = serializers.CharField(source='branch_state.name', read_only=True)
    branch_location_name = serializers.CharField(source='branch_location.name', read_only=True)
    
    class Meta:
        model = SubLocation
        fields = ['id', 'name', 'branch_state', 'branch_state_name', 'branch_location', 'branch_location_name', 'status']
    
    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Sub Location name is required")
        return value.strip()
    
    def validate_branch_state(self, value):
        if not value:
            raise serializers.ValidationError("Branch State is required")
        return value
    
    def validate_branch_location(self, value):
        if not value:
            raise serializers.ValidationError("Branch Location is required")
        return value
    
    def validate(self, data):
        branch_state = data.get('branch_state')
        branch_location = data.get('branch_location')
        
        if branch_state and branch_location:
            if branch_location.branch_state != branch_state:
                raise serializers.ValidationError(
                    {"branch_location": "Selected location does not belong to the selected state"}
                )
        return data


class PincodeSerializer(serializers.ModelSerializer):
    branch_state_name = serializers.CharField(source='branch_state.name', read_only=True)
    location_name = serializers.CharField(source='branch_location.name', read_only=True)
    sub_location_name = serializers.CharField(source='sub_location.name', read_only=True)

    class Meta:
        model = Pincode
        fields = ['id', 'pincode', 'branch_state', 'branch_state_name', 'branch_location', 'location_name', 'sub_location', 'sub_location_name', 'status', 'created_at']
        read_only_fields = ['id', 'created_at', 'branch_state_name', 'location_name', 'sub_location_name']

    def validate_pincode(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError('Pincode must be a 6-digit numeric string')
        return value

    def validate(self, data):
        branch_state = data.get('branch_state')
        branch_location = data.get('branch_location')
        sub_location = data.get('sub_location')

        if branch_state and branch_location:
            if branch_location.branch_state != branch_state:
                raise serializers.ValidationError({'branch_location': 'Selected location does not belong to the selected state'})

        if branch_location and sub_location:
            if sub_location.branch_location != branch_location:
                raise serializers.ValidationError({'sub_location': 'Selected sub-location does not belong to the selected location'})

        return data


class BranchInnerStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BranchInnerState
        fields = '__all__'


class BranchInnerLocationSerializer(serializers.ModelSerializer):
    branch_inner_state_name = serializers.CharField(source='branch_inner_state.name', read_only=True)
    branch_location_name = serializers.CharField(source='branch_location.name', read_only=True)

    class Meta:
        model = BranchInnerLocation
        fields = ['id', 'name', 'branch_inner_state', 'branch_inner_state_name', 'branch_location', 'branch_location_name', 'status']
        read_only_fields = ['id', 'branch_inner_state_name', 'branch_location_name']


class BankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = '__all__'


class TypeOfAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeOfAccount
        fields = '__all__'


class VendorBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorBank
        fields = '__all__'


class VendorBankDesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorBankDesignation
        fields = '__all__'


# DSA serializers
class DsaNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = DsaName
        fields = '__all__'


class LoanTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanType
        fields = '__all__'


class DsaCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DsaCode
        fields = "__all__"


class BankerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banker
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class PayoutTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutType
        fields = "__all__"


class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = "__all__"


class WorkIconSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkIcon
        fields = "__all__"





    

#offer serializers.py


class OffersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offers
        fields = '__all__'



# news Serializer

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = '__all__'




class PolicyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicyImage
        fields = '__all__'





class LoanVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanVideo
        fields = "__all__"



class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"



class SeminarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seminar
        fields = "__all__"



class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = "__all__"






#---------------SDSA SERIALIZERS----------------------------
# Add this to your serializers.py

class SDSAUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = SDSAUser
        fields = [
            'id', 'username', 'email_id', 'password', 'confirm_password',
            'alias_name', 'first_name', 'last_name', 'phone_number', 'alternative_mobile_number',
            'company_name', 'birth_date', 'office_address', 'residential_address',
            'aadhaar_number', 'pan_number', 'account_number', 'ifsc_code',
            'rank', 'status', 'reportingTo', 'branch_state', 'branch_location','branch_inner_state','branch_inner_location',
            'bank', 'type_of_account', 'pan_img', 'aadhaar_img', 'bank_proof_img',
            'company_logo', 'photo', 'ref_name_1', 'ref_relation_1', 'ref_mobile_1', 'ref_address_1',
            'ref_name_2', 'ref_relation_2', 'ref_mobile_2', 'ref_address_2',
            'createdBy', 'work_icons', 'payout_icons','created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'username', 'createdBy', 'created_at', 'updated_at']
        extra_kwargs = {
            'work_icons': {'required': False, 'allow_null': True},
            'payout_icons': {'required': False, 'allow_null': True}
        }



    def to_representation(self, instance):
        """Convert work_icons and payout_icons strings to arrays for GET requests"""
        representation = super().to_representation(instance)
        
        # Parse work_icons string to array
        work_icons_str = representation.get('work_icons')
        if work_icons_str:
            try:
                # Try to parse as JSON
                parsed = json.loads(work_icons_str)
                if isinstance(parsed, list):
                    representation['work_icons'] = parsed
                else:
                    # If it's not a list, create one
                    representation['work_icons'] = [str(parsed)]
            except (json.JSONDecodeError, TypeError):
                # If not JSON, try comma-separated
                if ',' in work_icons_str:
                    representation['work_icons'] = [
                        item.strip() for item in work_icons_str.split(',') 
                        if item.strip()
                    ]
                elif work_icons_str.strip():
                    representation['work_icons'] = [work_icons_str.strip()]
                else:
                    representation['work_icons'] = []
        else:
            representation['work_icons'] = []
        
        # Parse payout_icons string to array
        payout_icons_str = representation.get('payout_icons')
        if payout_icons_str:
            try:
                # Try to parse as JSON
                parsed = json.loads(payout_icons_str)
                if isinstance(parsed, list):
                    representation['payout_icons'] = parsed
                else:
                    # If it's not a list, create one
                    representation['payout_icons'] = [str(parsed)]
            except (json.JSONDecodeError, TypeError):
                # If not JSON, try comma-separated
                if ',' in payout_icons_str:
                    representation['payout_icons'] = [
                        item.strip() for item in payout_icons_str.split(',') 
                        if item.strip()
                    ]
                elif payout_icons_str.strip():
                    representation['payout_icons'] = [payout_icons_str.strip()]
                else:
                    representation['payout_icons'] = []
        else:
            representation['payout_icons'] = []
        
        return representation
    
    def to_internal_value(self, data):
        """Convert work_icons and payout_icons arrays to strings for POST/PUT/PATCH requests"""
        # Create a mutable copy of data
        data = data.copy()
        
        # Handle work_icons
        if 'work_icons' in data:
            work_icons_value = data['work_icons']
            
            if work_icons_value is None or work_icons_value == '':
                data['work_icons'] = '[]'
            elif isinstance(work_icons_value, list):
                # Convert list to JSON string
                if len(work_icons_value) == 0:
                    data['work_icons'] = '[]'
                else:
                    data['work_icons'] = json.dumps(work_icons_value)
            elif isinstance(work_icons_value, str):
                # If it's already a string, try to validate it
                if work_icons_value.strip().startswith('[') and work_icons_value.strip().endswith(']'):
                    # Already JSON, keep as is
                    try:
                        json.loads(work_icons_value)
                        data['work_icons'] = work_icons_value
                    except json.JSONDecodeError:
                        data['work_icons'] = '[]'
                else:
                    # Not JSON, convert to JSON array
                    if ',' in work_icons_value:
                        items = [item.strip() for item in work_icons_value.split(',') if item.strip()]
                        if len(items) == 0:
                            data['work_icons'] = '[]'
                        else:
                            data['work_icons'] = json.dumps(items)
                    elif work_icons_value.strip():
                        data['work_icons'] = json.dumps([work_icons_value.strip()])
                    else:
                        data['work_icons'] = '[]'
        
        # Handle payout_icons (same logic as work_icons)
        if 'payout_icons' in data:
            payout_icons_value = data['payout_icons']
            
            if payout_icons_value is None or payout_icons_value == '':
                data['payout_icons'] = '[]'
            elif isinstance(payout_icons_value, list):
                # Convert list to JSON string
                if len(payout_icons_value) == 0:
                    data['payout_icons'] = '[]'
                else:
                    data['payout_icons'] = json.dumps(payout_icons_value)
            elif isinstance(payout_icons_value, str):
                # If it's already a string, try to validate it
                if payout_icons_value.strip().startswith('[') and payout_icons_value.strip().endswith(']'):
                    # Already JSON, keep as is
                    try:
                        json.loads(payout_icons_value)
                        data['payout_icons'] = payout_icons_value
                    except json.JSONDecodeError:
                        data['payout_icons'] = '[]'
                else:
                    # Not JSON, convert to JSON array
                    if ',' in payout_icons_value:
                        items = [item.strip() for item in payout_icons_value.split(',') if item.strip()]
                        if len(items) == 0:
                            data['payout_icons'] = '[]'
                        else:
                            data['payout_icons'] = json.dumps(items)
                    elif payout_icons_value.strip():
                        data['payout_icons'] = json.dumps([payout_icons_value.strip()])
                    else:
                        data['payout_icons'] = '[]'
        
        return super().to_internal_value(data)
    
    def validate(self, data):
        # Check if passwords match
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match"
            })
        
        # Remove confirm_password as it's not a model field
        data.pop('confirm_password', None)
        
        # Validate email format
        email = data.get('email_id')
        if email:
            from django.core.validators import validate_email
            from django.core.exceptions import ValidationError
            try:
                validate_email(email)
            except ValidationError:
                raise serializers.ValidationError({
                    "email_id": "Enter a valid email address"
                })
        
        # Validate phone number
        phone_regex = r'^\d{10}$'
        if data.get('phone_number') and not re.match(phone_regex, data['phone_number']):
            raise serializers.ValidationError({
                "phone_number": "Phone number must be 10 digits"
            })
        
        # Validate Aadhaar number
        if data.get('aadhaar_number') and (not data['aadhaar_number'].isdigit() or len(data['aadhaar_number']) != 12):
            raise serializers.ValidationError({
                "aadhaar_number": "Aadhaar number must be 12 digits"
            })
        
        # Validate PAN number
        if data.get('pan_number'):
            pan = data['pan_number'].upper()
            if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', pan):
                raise serializers.ValidationError({
                    "pan_number": "Invalid PAN number format"
                })
            data['pan_number'] = pan
        
        # Validate IFSC code
        if data.get('ifsc_code'):
            ifsc = data['ifsc_code'].upper()
            if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', ifsc):
                raise serializers.ValidationError({
                    "ifsc_code": "Invalid IFSC code format"
                })
            data['ifsc_code'] = ifsc
        
        return data
    
    def create(self, validated_data):
        # Set createdBy to current user
        request = self.context.get('request')
        if request and request.user:
            validated_data['createdBy'] = request.user
        
        return SDSAUser.objects.create(**validated_data)
    







#---------------Partners SERIALIZERS----------------------------



class PartnerTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnerType
        fields = '__all__'





# Add this to your serializers.py

class PartnerUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    # Make work_icons and payout_icons regular fields
    work_icons = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    payout_icons = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = PartnerUser
        fields = [
            'id', 'username', 'email_id', 'password', 'confirm_password',
            'alias_name', 'first_name', 'last_name', 'phone_number', 'alternative_mobile_number',
            'company_name', 'birth_date', 'partner_type', 'office_address', 'residential_address',
            'aadhaar_number', 'pan_number', 'account_number', 'ifsc_code',
            'rank', 'status', 'reportingTo', 'branch_state', 'branch_location','branch_inner_state','branch_inner_location',
            'bank', 'type_of_account', 'pan_img', 'aadhaar_img', 'bank_proof_img',
            'company_logo', 'photo', 'ref_name_1', 'ref_relation_1', 'ref_mobile_1', 'ref_address_1',
            'ref_name_2', 'ref_relation_2', 'ref_mobile_2', 'ref_address_2',
            'createdBy', 'work_icons', 'payout_icons',
        ]
        read_only_fields = ['id', 'username', 'createdBy']
        extra_kwargs = {
            'work_icons': {'required': False, 'allow_null': True},
            'payout_icons': {'required': False, 'allow_null': True}
        }
    

    def to_representation(self, instance):
        """Convert work_icons and payout_icons strings to arrays for GET requests"""
        representation = super().to_representation(instance)
        
        # Parse work_icons string to array
        work_icons_str = representation.get('work_icons')
        if work_icons_str:
            try:
                # Try to parse as JSON
                parsed = json.loads(work_icons_str)
                if isinstance(parsed, list):
                    representation['work_icons'] = parsed
                else:
                    # If it's not a list, create one
                    representation['work_icons'] = [str(parsed)]
            except (json.JSONDecodeError, TypeError):
                # If not JSON, try comma-separated
                if ',' in work_icons_str:
                    representation['work_icons'] = [
                        item.strip() for item in work_icons_str.split(',') 
                        if item.strip()
                    ]
                elif work_icons_str.strip():
                    representation['work_icons'] = [work_icons_str.strip()]
                else:
                    representation['work_icons'] = []
        else:
            representation['work_icons'] = []
        
        # Parse payout_icons string to array
        payout_icons_str = representation.get('payout_icons')
        if payout_icons_str:
            try:
                # Try to parse as JSON
                parsed = json.loads(payout_icons_str)
                if isinstance(parsed, list):
                    representation['payout_icons'] = parsed
                else:
                    # If it's not a list, create one
                    representation['payout_icons'] = [str(parsed)]
            except (json.JSONDecodeError, TypeError):
                # If not JSON, try comma-separated
                if ',' in payout_icons_str:
                    representation['payout_icons'] = [
                        item.strip() for item in payout_icons_str.split(',') 
                        if item.strip()
                    ]
                elif payout_icons_str.strip():
                    representation['payout_icons'] = [payout_icons_str.strip()]
                else:
                    representation['payout_icons'] = []
        else:
            representation['payout_icons'] = []
        
        return representation
    
    def to_internal_value(self, data):
        """Convert work_icons and payout_icons arrays to strings for POST/PUT/PATCH requests"""
        # Create a mutable copy of data
        data = data.copy()
        
        # Handle work_icons
        if 'work_icons' in data:
            work_icons_value = data['work_icons']
            
            if work_icons_value is None or work_icons_value == '':
                data['work_icons'] = '[]'
            elif isinstance(work_icons_value, list):
                # Convert list to JSON string
                if len(work_icons_value) == 0:
                    data['work_icons'] = '[]'
                else:
                    data['work_icons'] = json.dumps(work_icons_value)
            elif isinstance(work_icons_value, str):
                # If it's already a string, try to validate it
                if work_icons_value.strip().startswith('[') and work_icons_value.strip().endswith(']'):
                    # Already JSON, keep as is
                    try:
                        json.loads(work_icons_value)
                        data['work_icons'] = work_icons_value
                    except json.JSONDecodeError:
                        data['work_icons'] = '[]'
                else:
                    # Not JSON, convert to JSON array
                    if ',' in work_icons_value:
                        items = [item.strip() for item in work_icons_value.split(',') if item.strip()]
                        if len(items) == 0:
                            data['work_icons'] = '[]'
                        else:
                            data['work_icons'] = json.dumps(items)
                    elif work_icons_value.strip():
                        data['work_icons'] = json.dumps([work_icons_value.strip()])
                    else:
                        data['work_icons'] = '[]'
        
        # Handle payout_icons (same logic as work_icons)
        if 'payout_icons' in data:
            payout_icons_value = data['payout_icons']
            
            if payout_icons_value is None or payout_icons_value == '':
                data['payout_icons'] = '[]'
            elif isinstance(payout_icons_value, list):
                # Convert list to JSON string
                if len(payout_icons_value) == 0:
                    data['payout_icons'] = '[]'
                else:
                    data['payout_icons'] = json.dumps(payout_icons_value)
            elif isinstance(payout_icons_value, str):
                # If it's already a string, try to validate it
                if payout_icons_value.strip().startswith('[') and payout_icons_value.strip().endswith(']'):
                    # Already JSON, keep as is
                    try:
                        json.loads(payout_icons_value)
                        data['payout_icons'] = payout_icons_value
                    except json.JSONDecodeError:
                        data['payout_icons'] = '[]'
                else:
                    # Not JSON, convert to JSON array
                    if ',' in payout_icons_value:
                        items = [item.strip() for item in payout_icons_value.split(',') if item.strip()]
                        if len(items) == 0:
                            data['payout_icons'] = '[]'
                        else:
                            data['payout_icons'] = json.dumps(items)
                    elif payout_icons_value.strip():
                        data['payout_icons'] = json.dumps([payout_icons_value.strip()])
                    else:
                        data['payout_icons'] = '[]'
        
        return super().to_internal_value(data)
    
    
    
    def validate(self, data):
        # Check if passwords match
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match"
            })
        
        # Remove confirm_password as it's not a model field
        data.pop('confirm_password', None)
        
        # Validate email format
        email = data.get('email_id')
        if email:
            from django.core.validators import validate_email
            from django.core.exceptions import ValidationError
            try:
                validate_email(email)
            except ValidationError:
                raise serializers.ValidationError({
                    "email_id": "Enter a valid email address"
                })
        
        # Validate phone number
        phone_regex = r'^\d{10}$'
        if data.get('phone_number') and not re.match(phone_regex, data['phone_number']):
            raise serializers.ValidationError({
                "phone_number": "Phone number must be 10 digits"
            })
        
        # Validate Aadhaar number
        if data.get('aadhaar_number') and (not data['aadhaar_number'].isdigit() or len(data['aadhaar_number']) != 12):
            raise serializers.ValidationError({
                "aadhaar_number": "Aadhaar number must be 12 digits"
            })
        
        # Validate PAN number
        if data.get('pan_number'):
            pan = data['pan_number'].upper()
            if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', pan):
                raise serializers.ValidationError({
                    "pan_number": "Invalid PAN number format"
                })
            data['pan_number'] = pan
        
        # Validate IFSC code
        if data.get('ifsc_code'):
            ifsc = data['ifsc_code'].upper()
            if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', ifsc):
                raise serializers.ValidationError({
                    "ifsc_code": "Invalid IFSC code format"
                })
            data['ifsc_code'] = ifsc
        
        return data
    
    def create(self, validated_data):
        # Set createdBy to current user
        request = self.context.get('request')
        if request and request.user:
            validated_data['createdBy'] = request.user
        
        return PartnerUser.objects.create(**validated_data)
    





#---------Vehicle Make serializers------------

class VehicleMakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleMake
        fields = '__all__'



class VehicleModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleModel
        fields = '__all__'



class ManufactureYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManufactureYear
        fields = '__all__'



class CompanyNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyName
        fields = '__all__'



class CustomerTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerType
        fields = '__all__'



class IndustryTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndustryType
        fields = '__all__'



class BusinessTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessType
        fields = '__all__'




#---------Vehicle add insurance serializers------------

class VehicleInsuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleInsurance
        fields = '__all__'





class VehicleDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleDocument
        fields = '__all__'



class VehicleInsuranceDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleInsuranceDetails
        fields = '__all__'







#-----------------HEALTH INSURANCE SERIALIZERS -----------------
class InsuranceCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceCompany
        fields = '__all__'



class TypeOfPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = TypeOfPolicy
        fields = '__all__'



class HealthInsuranceAgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthInsuranceAge
        fields = '__all__'



class NumberOfPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = NumberOfPerson
        fields = '__all__'



class HealthInsuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthInsurance
        fields = '__all__'




class HealthInsuranceDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthInsuranceDetails
        fields = '__all__'